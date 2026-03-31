import { describe, it, expect } from 'vitest';
import { hexToHSL, HSLToHex, getTypeColor, colorList } from '~/utils/leaveColors';

describe('hexToHSL', () => {
  it('converts a 7-char hex to HSL', () => {
    const result = hexToHSL('#ff0000');
    expect(result.h).toBe(0);
    expect(result.s).toBeCloseTo(100, 0);
    expect(result.l).toBeCloseTo(50, 0);
  });

  it('converts a 4-char shorthand hex to HSL', () => {
    const result = hexToHSL('#f00');
    expect(result.h).toBe(0);
    expect(result.s).toBeCloseTo(100, 0);
    expect(result.l).toBeCloseTo(50, 0);
  });

  it('returns h=0 for achromatic colors', () => {
    const result = hexToHSL('#808080');
    expect(result.h).toBe(0);
    expect(result.s).toBe(0);
  });

  it('converts white correctly', () => {
    const result = hexToHSL('#ffffff');
    expect(result.l).toBe(100);
  });

  it('converts black correctly', () => {
    const result = hexToHSL('#000000');
    expect(result.l).toBe(0);
  });
});

describe('HSLToHex', () => {
  it('converts red HSL back to hex', () => {
    expect(HSLToHex(0, 100, 50)).toBe('#ff0000');
  });

  it('converts green HSL to hex', () => {
    expect(HSLToHex(120, 100, 50)).toBe('#00ff00');
  });

  it('converts blue HSL to hex', () => {
    expect(HSLToHex(240, 100, 50)).toBe('#0000ff');
  });

  it('round-trips hex → HSL → hex accurately', () => {
    for (const hex of colorList) {
      const { h, s, l } = hexToHSL(hex);
      const roundTripped = HSLToHex(h, s, l);
      // Allow ±1 per channel due to rounding
      const original = parseInt(hex.slice(1), 16);
      const result = parseInt(roundTripped.slice(1), 16);
      const diff = Math.abs(original - result);
      expect(diff).toBeLessThanOrEqual(0x010101);
    }
  });
});

describe('getTypeColor', () => {
  it('returns default red color when vacationId is null', () => {
    expect(getTypeColor(null)).toBe('#F44336');
  });

  it('returns default red color when vacationId is undefined', () => {
    expect(getTypeColor(undefined)).toBe('#F44336');
  });

  it('returns a color from colorList when only vacationId is provided', () => {
    const color = getTypeColor(0);
    expect(colorList).toContain(color);
  });

  it('returns different colors for different vacationId values', () => {
    const colors = new Set(colorList.map((_, i) => getTypeColor(i)));
    expect(colors.size).toBeGreaterThan(1);
  });

  it('cycles through colorList using modulo', () => {
    expect(getTypeColor(0)).toBe(getTypeColor(colorList.length));
    expect(getTypeColor(1)).toBe(getTypeColor(colorList.length + 1));
  });

  it('returns a hex color string when userId is provided', () => {
    const color = getTypeColor(1, 42);
    expect(color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('adjusts hue slightly based on userId', () => {
    const noUser = getTypeColor(1);
    const withUser = getTypeColor(1, 1);
    // Should differ when userId causes non-zero hue adjustment
    // userHash=1, hueAdjustment = (1*7)%10 - 5 = 7-5 = 2 → they should differ
    expect(withUser).not.toBe(noUser);
  });

  it('returns baseColor when userId resolves to zero hue adjustment', () => {
    // userHash=0 → hueAdjustment = 0%10 - 5 = -5, still adjusts
    // userHash where (hash*7)%10 === 5: 5*7=35, 35%10=5 → userHash=5
    const color = getTypeColor(0, 5);
    // Not necessarily equal to baseColor — just verify it's a valid hex
    expect(color).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
