import { useState, useEffect, useRef } from 'react';
import { useGameStore } from './store/gameStore';
import { formatMoney } from './utils/calculations';
import { COIN_TYPES } from './utils/constants';
import { BackgroundPattern } from './components/BackgroundPattern';
import { Coin } from './components/Coin';
import { MoneyDisplay } from './components/MoneyDisplay';
import { FloatingText } from './components/FloatingText';
import type { FloatingTextRef } from './components/FloatingText';
import './App.css';

function App() {
  const { money, coins, buyCoin, getCoinCost, addMoney, buyAutoClicker, toggleAutoClicker, getAutoClickerCost, hasAutoClicker, isAutoClickerEnabled } = useGameStore();
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const floatingTextRefs = useRef<Record<string, FloatingTextRef | null>>({});

  const coinTypeIds = Object.keys(COIN_TYPES);

  const handleBuyCoin = (typeId: string) => {
    buyCoin(typeId);
    floatingTextRefs.current[typeId]?.show();
  };

  const handleBuyAutoClicker = (typeId: string) => {
    buyAutoClicker(typeId);
    floatingTextRefs.current[`auto_${typeId}`]?.show();
  };

  // Cheat code: Ctrl+M adds $1000
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        addMoney(1000);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addMoney]);

  return (
    <>
      <BackgroundPattern />
      <div className="app">
      <header className="header">
        <h1>Coin Flipper</h1>
        <div className="header-coin-counts">
          {coinTypeIds.map((typeId) => {
            const count = coins.filter((c) => c.typeId === typeId).length;
            if (count === 0) return null;
            return (
              <div key={typeId} className={`header-coin-item coin-type-${typeId}`}>
                <div className="header-coin-icon">
                  <span className="header-coin-value">{COIN_TYPES[typeId].baseValue}</span>
                </div>
                <span className="header-coin-count">×{count}</span>
              </div>
            );
          })}
        </div>
        <MoneyDisplay money={money} />
      </header>

      <main className="main">
        <h2 className="coin-area-title">Your Coins ({coins.length})</h2>
        <section className="coin-area">
          <div className="coin-area-content">
            <div className="coins-grid">
              {coins.map((coin) => (
                <Coin key={coin.id} coin={coin} />
              ))}
            </div>
          </div>
        </section>

        <aside className={`store ${isStoreOpen ? 'open' : 'collapsed'}`}>
          <button
            className="store-toggle"
            onClick={() => setIsStoreOpen(!isStoreOpen)}
            aria-label={isStoreOpen ? 'Collapse store' : 'Expand store'}
          >
            {isStoreOpen ? '›' : '‹'}
          </button>
          
          <div className="store-content">
            <h2>Store</h2>
            <MoneyDisplay money={money} />
            <div className="store-divider" />
            {coinTypeIds.map((typeId) => {
              const coinType = COIN_TYPES[typeId];
              const cost = getCoinCost(typeId);
              const canAfford = money >= cost;
              const autoClickerCost = getAutoClickerCost(typeId);
              const hasAuto = hasAutoClicker(typeId);
              const isAutoEnabled = isAutoClickerEnabled(typeId);
              const canAffordAuto = money >= autoClickerCost;
              const ownedCount = coins.filter((c) => c.typeId === typeId).length;
              return (
                <div key={typeId} className={`coin-card coin-tier-${typeId}`}>
                  <div className="coin-card-header">
                    <span className="coin-card-name">{coinType.name}</span>
                    <span className="coin-card-value">+${coinType.baseValue}/flip</span>
                    {ownedCount > 0 && (
                      <span className="coin-card-owned">×{ownedCount}</span>
                    )}
                  </div>
                  <div className="coin-card-actions">
                    <button
                      className="coin-card-btn buy"
                      onClick={() => canAfford && handleBuyCoin(typeId)}
                      disabled={!canAfford}
                    >
                      <span className="btn-label">Buy</span>
                      <span className="btn-price">{formatMoney(cost)}</span>
                      <FloatingText
                        ref={(el) => { floatingTextRefs.current[typeId] = el; }}
                        text={`-${formatMoney(cost)}`}
                        variant="spend"
                      />
                    </button>
                    {hasAuto ? (
                      <button
                        className={`coin-card-btn auto toggle ${isAutoEnabled ? 'enabled' : 'disabled'}`}
                        onClick={() => toggleAutoClicker(typeId)}
                        title={isAutoEnabled ? 'Click to pause auto-flip' : 'Click to resume auto-flip'}
                      >
                        <span className="btn-label">{isAutoEnabled ? 'ON' : 'OFF'}</span>
                        <span className="btn-price">Auto</span>
                      </button>
                    ) : (
                      <button
                        className="coin-card-btn auto"
                        onClick={() => canAffordAuto && handleBuyAutoClicker(typeId)}
                        disabled={!canAffordAuto}
                        title="Auto-flip all coins of this type"
                      >
                        <span className="btn-label">Auto</span>
                        <span className="btn-price">{formatMoney(autoClickerCost)}</span>
                        <FloatingText
                          ref={(el) => { floatingTextRefs.current[`auto_${typeId}`] = el; }}
                          text={`-${formatMoney(autoClickerCost)}`}
                          variant="spend"
                        />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </main>
    </div>
    </>
  );
}

export default App;
