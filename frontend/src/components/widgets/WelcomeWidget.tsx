export function WelcomeWidget() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-2 select-none">
      {/* Glowing berry */}
      <div className="relative">
        <div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ background: `rgb(var(--color-accent) / 0.35)`, transform: 'scale(1.4)' }}
        />
        <div className="relative text-5xl leading-none">🍓</div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div
          className="text-xl font-bold"
          style={{
            background: `linear-gradient(135deg, rgb(var(--color-text)), rgb(var(--color-accent)))`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Welcome to Raspidash
        </div>
        <div className="text-xs text-tx-muted max-w-[220px] leading-relaxed">
          Click <span className="text-accent-blue font-medium">Settings ⚙</span> to add your
          integrations, then <span className="text-accent-blue font-medium">Edit Layout</span> to
          build your dashboard.
        </div>
      </div>

      {/* Quick-start steps */}
      <div className="flex flex-col gap-1.5 w-full max-w-[200px]">
        {[
          { n: '1', text: 'Add an integration' },
          { n: '2', text: 'Add widgets' },
          { n: '3', text: 'Drag to arrange' },
        ].map(({ n, text }) => (
          <div key={n} className="flex items-center gap-2.5 text-xs text-tx-muted">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
              style={{ background: `rgb(var(--color-accent) / 0.2)`, color: `rgb(var(--color-accent))` }}
            >
              {n}
            </div>
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
