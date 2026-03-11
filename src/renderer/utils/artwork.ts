export function getArtworkUrl(artwork: { url?: string } | undefined, size: number = 300): string {
  if (!artwork?.url) return '';
  return artwork.url.replace('{w}', String(size)).replace('{h}', String(size));
}

export function getArtworkUrlFromString(url: string | undefined | null, size: number = 300): string {
  if (!url) return '';
  if (url.includes('{w}')) return url.replace('{w}', String(size)).replace('{h}', String(size));
  return url.replace(/\d+x\d+/, `${size}x${size}`);
}
