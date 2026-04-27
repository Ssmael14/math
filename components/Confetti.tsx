export function Confetti() {
  const pieces = Array.from({ length: 30 });
  const colors = ["#FFC94A", "#FF8FB1", "#6FBEE8", "#68C886", "#B088DB", "#FFB199"];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 2;
        const duration = 2 + Math.random() * 2;
        const color = colors[i % colors.length];
        const size = 6 + Math.random() * 8;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: -20,
              left: `${left}%`,
              width: size,
              height: size,
              background: color,
              borderRadius: i % 2 ? "50%" : "2px",
              animation: `confetti-fall ${duration}s linear ${delay}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}
