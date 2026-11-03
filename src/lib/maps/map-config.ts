export const MAP_CONFIG = {
  defaultCenter: [14.4408576, 75.9332864] as [number, number], // Wellness Diagnostic Center, Vidyanagar, Davangere
  defaultZoom: 14,
  minZoom: 5,
  maxZoom: 18,
  tileUrl:
    process.env.NEXT_PUBLIC_MAP_TILE_URL ||
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution:
    process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ||
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};
