// Generates an inline SVG data-URI placeholder showing a team's initial.
// Used as an <img onError> fallback — a data URI can never fail to load,
// unlike remote placeholder services (e.g. via.placeholder.com, now defunct).

const PLACEHOLDER_COLORS = ['#00d4ff', '#0066ff', '#00ff88', '#1d428a', '#552583', '#C8102E'];

export function teamInitialPlaceholder(teamName: string, size = 48): string {
  const initial = (teamName || '?').trim().charAt(0).toUpperCase() || '?';
  const color = PLACEHOLDER_COLORS[Math.abs(hash(teamName)) % PLACEHOLDER_COLORS.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="10" fill="${color}"/><text x="50%" y="50%" dy="0.36em" text-anchor="middle" font-family="system-ui, sans-serif" font-size="${Math.round(size * 0.45)}" font-weight="700" fill="#ffffff">${initial}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return h;
}
