import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
}

function oklchToRgb(l: number, c: number, h: number): string {
  // Convert OKLCH to RGB for Three.js
  // This is a simplified conversion - for production, use a proper color library
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  
  // Simplified Lab to RGB conversion
  const y = (l + 0.16) / 1.16;
  const x = y + a / 5;
  const z = y - b / 2;
  
  let r = 3.2406 * x - 1.5372 * y - 0.4986 * z;
  let g = -0.9689 * x + 1.8758 * y + 0.0415 * z;
  let bl = 0.0557 * x - 0.2040 * y + 1.0570 * z;
  
  // Gamma correction
  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
  bl = bl > 0.0031308 ? 1.055 * Math.pow(bl, 1 / 2.4) - 0.055 : 12.92 * bl;
  
  // Clamp and convert to hex
  r = Math.max(0, Math.min(1, r));
  g = Math.max(0, Math.min(1, g));
  bl = Math.max(0, Math.min(1, bl));
  
  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(bl)}`;
}

function parseOklch(oklchString: string): { l: number; c: number; h: number } {
  const match = oklchString.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
  if (match) {
    return {
      l: parseFloat(match[1]),
      c: parseFloat(match[2]),
      h: parseFloat(match[3]),
    };
  }
  return { l: 0.5, c: 0.1, h: 160 };
}

export function useThemeColors(): ThemeColors {
  const { theme, systemTheme } = useTheme();
  const [colors, setColors] = useState<ThemeColors>({
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#ec4899',
    chart1: '#3b82f6',
    chart2: '#10b981',
    chart3: '#f59e0b',
    chart4: '#ef4444',
    chart5: '#8b5cf6',
  });

  useEffect(() => {
    const updateColors = () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      
      const getColor = (varName: string): string => {
        const value = computedStyle.getPropertyValue(varName).trim();
        const oklch = parseOklch(`oklch(${value})`);
        return oklchToRgb(oklch.l, oklch.c, oklch.h);
      };

      setColors({
        primary: getColor('--primary'),
        secondary: getColor('--secondary'),
        accent: getColor('--accent'),
        chart1: getColor('--chart-1'),
        chart2: getColor('--chart-2'),
        chart3: getColor('--chart-3'),
        chart4: getColor('--chart-4'),
        chart5: getColor('--chart-5'),
      });
    };

    updateColors();
    
    // Update when theme changes
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [theme, systemTheme]);

  return colors;
}
