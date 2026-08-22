// ponytail: lucide-react dropped brand icons — small inline SVGs instead of a
// new icon-pack dependency for two logos.

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.507 17.523 2 12 2S2 6.507 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.877h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.92 8.437-9.94Z" />
    </svg>
  );
}

export function ZaloIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path
        fill="var(--zalo-fg, white)"
        d="M7.2 8.4h4.6c.35 0 .58.37.42.68l-3.1 5.62h2.68a.4.4 0 0 1 0 .8H6.9a.42.42 0 0 1-.37-.63l3.1-5.63H7.2a.42.42 0 0 1 0-.84Zm7.5 6.9c-1.32 0-2.1-.98-2.1-2.35 0-1.62 1.03-3.15 2.5-3.15 1.32 0 2.1.98 2.1 2.35 0 1.62-1.03 3.15-2.5 3.15Zm.28-4.66c-.72 0-1.24.98-1.24 2.05 0 .82.36 1.4 1 1.4.72 0 1.24-.98 1.24-2.05 0-.82-.36-1.4-1-1.4Zm3.87-.36h.8v4.86h-.8V10.28Z"
      />
    </svg>
  );
}
