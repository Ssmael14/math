type IconProps = {
  className?: string;
  filled?: boolean;
};

const baseProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function HomeIcon({ className, filled }: IconProps) {
  return (
    <svg {...baseProps} className={className} fill={filled ? "currentColor" : "none"}>
      <path d="M3 10.5 12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5H15v-6h-6v6H4.5A1.5 1.5 0 0 1 3 20Z" />
    </svg>
  );
}

export function BookIcon({ className, filled }: IconProps) {
  return (
    <svg {...baseProps} className={className} fill={filled ? "currentColor" : "none"}>
      <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v15H6a2 2 0 0 0-2 2Z" />
      <path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H19" />
    </svg>
  );
}

export function TrophyIcon({ className, filled }: IconProps) {
  return (
    <svg {...baseProps} className={className} fill={filled ? "currentColor" : "none"}>
      <path d="M8 4h8v5a4 4 0 0 1-8 0Z" />
      <path d="M16 5h3v2a3 3 0 0 1-3 3M8 5H5v2a3 3 0 0 0 3 3" />
      <path d="M10 14h4v3h-4zM9 21h6M12 17v4" />
    </svg>
  );
}

export function BagIcon({ className, filled }: IconProps) {
  return (
    <svg {...baseProps} className={className} fill={filled ? "currentColor" : "none"}>
      <path d="M5 8h14l-1 12a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 20Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export function UserIcon({ className, filled }: IconProps) {
  return (
    <svg {...baseProps} className={className} fill={filled ? "currentColor" : "none"}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

export function FlameIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className} fill="#FF8A3C" stroke="#E25A1B" strokeWidth={1.5}>
      <path d="M12 3c1 3 3 4 3 7a3 3 0 0 1-1 2.3A2.5 2.5 0 0 0 13 12c0-1-.7-1.7-1-2-.4 1-1.5 1.6-1.5 3 0 .8.4 1.4.8 1.8A4 4 0 0 1 8 13a5 5 0 0 1 1-3c.5 1 1 1.3 1.5 1.3 0-2.5-.8-4 1.5-8.3Z" />
      <path d="M7 14a5 5 0 1 0 10 0c0 4-2.5 7-5 7s-5-3-5-7Z" />
    </svg>
  );
}

export function GemIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className} fill="#6FBEE8" stroke="#3A8FBF" strokeWidth={1.5}>
      <path d="M6 4h12l3 5-9 12L3 9Z" />
      <path d="M3 9h18M9 4l3 5 3-5M12 9l-3 12M12 9l3 12" stroke="#3A8FBF" />
    </svg>
  );
}

export function HeartIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className} fill="#FF5A78" stroke="#C93658" strokeWidth={1.5}>
      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
