import React from "react";

interface ArgentMarkProps {
  size?: number;
  className?: string;
}

/** Negative / Print icon mark matching App/Argent.icon and design/icons/opus/2-negative-print. */
export function ArgentMark({ size = 28, className = "" }: ArgentMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="argent-mark-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#34353A" />
          <stop offset="1" stopColor="#1B1C1F" />
        </linearGradient>
      </defs>
      <rect x="64" y="64" width="896" height="896" rx="220" fill="url(#argent-mark-bg)" />
      <g transform="translate(100 100) scale(0.804688)">
        <path
          fill="#B45A26"
          d="M505 212H324A112 112 0 0 0 212 324V700A112 112 0 0 0 324 812H505Z"
        />
        <path
          fill="#DEDFE1"
          d="M519 212H700A112 112 0 0 1 812 324V700A112 112 0 0 1 700 812H519V684A172 172 0 0 0 519 340Z"
        />
        <path fill="#F2B27A" d="M505 340A172 172 0 0 0 505 684Z" />
      </g>
    </svg>
  );
}
