export const MAP_CONFIG = {
  defaultCenter: [28.4595, 77.0266] as [number, number], // Delhi NCR / Gurugram
  defaultZoom: 13,
  minZoom: 5,
  maxZoom: 18,
  tileUrl:
    process.env.NEXT_PUBLIC_MAP_TILE_URL ||
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution:
    process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ||
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};
