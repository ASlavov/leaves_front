export const colorList = [
  '#F44336',
  '#9C27B0',
  '#3F51B5',
  '#2196F3',
  '#009688',
  '#FFC107',
  '#FF5722',
  '#795548',
  '#607D8B',
  '#4CAF50',
];

// Function to convert HEX to HSL
export function hexToHSL(H: string) {
  // Convert hex to RGB
  let r = 0,
    g = 0,
    b = 0;
  if (H.length === 4) {
    r = parseInt(H[1] + H[1], 16);
    g = parseInt(H[2] + H[2], 16);
    b = parseInt(H[3] + H[3], 16);
  } else if (H.length === 7) {
    r = parseInt(H[1] + H[2], 16);
    g = parseInt(H[3] + H[4], 16);
    b = parseInt(H[5] + H[6], 16);
  }
  r /= 255;
  g /= 255;
  b /= 255;
  const cmin = Math.min(r, g, b);
  const cmax = Math.max(r, g, b);
  const delta = cmax - cmin;
  let h = 0;
  let s = 0;
  let l = 0;

  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return { h, s, l };
}

// Function to convert HSL to HEX
export function HSLToHex(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }
  let r_hex = Math.round((r + m) * 255).toString(16);
  let g_hex = Math.round((g + m) * 255).toString(16);
  let b_hex = Math.round((b + m) * 255).toString(16);
  if (r_hex.length === 1) r_hex = '0' + r_hex;
  if (g_hex.length === 1) g_hex = '0' + g_hex;
  if (b_hex.length === 1) b_hex = '0' + b_hex;
  return '#' + r_hex + g_hex + b_hex;
}

export const getTypeColor = (
  vacationId: string | number | null | undefined,
  userId?: string | number,
) => {
  if (!vacationId) return '#F44336';

  const index = parseInt(String(vacationId)) % colorList.length;
  const baseColor = colorList[index];

  if (!userId) return baseColor;

  const hsl = hexToHSL(baseColor);

  // Adjust the hue slightly based on userId
  const userHash = parseInt(String(userId)) || 0;
  const hueAdjustment = ((userHash * 7) % 10) - 5;

  const newHue = (hsl.h + hueAdjustment + 360) % 360;

  return HSLToHex(newHue, hsl.s, hsl.l);
};
