import './BackgroundPattern.css';

export function BackgroundPattern() {
  return (
    <div className="background-pattern" aria-hidden="true">
      <div className="pattern-layer">
        {Array.from({ length: 25 }).map((_, row) => (
          <div key={row} className="pattern-row">
            {Array.from({ length: 35 }).map((_, col) => (
              <span key={col} className="suit">
                {['♠', '♥', '♦', '♣'][(row + col) % 4]}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
