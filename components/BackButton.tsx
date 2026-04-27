"use client";
import { useRouter } from "next/navigation";

interface Props {
  href?: string;
  className?: string;
}

export function BackButton({ href, className = "" }: Props) {
  const router = useRouter();
  return (
    <button
      onClick={() => (href ? router.push(href) : router.back())}
      className={`btn-chunky bg-white rounded-xl w-9 h-9 flex items-center justify-center ${className}`}
      style={{ boxShadow: "var(--shadow-chunky-sm)" }}
      aria-label="Volver"
    >
      <svg width="14" height="14" viewBox="0 0 24 24">
        <path d="M15 6l-8 6 8 6" stroke="#3D2E4F" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    </button>
  );
}
