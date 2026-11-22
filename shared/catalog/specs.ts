/**
 * 规范尺寸目录（来源：改造方案「强制尺寸目录」「图标 @2x 输出」「顶部栏」）。
 * 这里的数值是硬规则：编辑器和导出都从这里读，禁止在组件里写死。
 */

export const H5_CANVAS = { width: 750, defaultHeight: 1334, contentWidth: 710 } as const;
export const PC_CANVAS = { width: 1920, contentWidth: 1200 } as const;

export type BannerSpecId = 'large' | 'general' | 'small';
export const BANNER_SPECS: Record<BannerSpecId, { label: string; width: number; height: number }> = {
  large: { label: '大 Banner', width: 1080, height: 490 },
  general: { label: '通用 Banner', width: 1020, height: 300 },
  small: { label: '小 Banner', width: 386, height: 244 },
};

export type IconClass = 'bottomnav' | 'midnav' | 'gametype';
/** 逻辑尺寸用于页面摆放与 Figma 图层；PNG 资源按 @2x 像素交付。 */
export const ICON_SPECS: Record<IconClass, { label: string; width: number; height: number; scale: 2 }> = {
  bottomnav: { label: '底部导航图标', width: 70, height: 70, scale: 2 },
  midnav: { label: '中部导航图标', width: 80, height: 70, scale: 2 },
  gametype: { label: '游戏类型图标', width: 100, height: 76, scale: 2 },
};

export type CardSizeId = '180x180' | '520x203' | '300x400' | '300x300' | '400x250';
/**
 * 游戏卡片规格。注意：方案要求把 A1–A7 样式逐一登记，目前只拿到 5 个尺寸，
 * 样式与尺寸的对应关系【待核定】，见 docs/assumptions.md。
 */
export const CARD_SPECS: Record<CardSizeId, { width: number; height: number }> = {
  '180x180': { width: 180, height: 180 },
  '520x203': { width: 520, height: 203 },
  '300x400': { width: 300, height: 400 },
  '300x300': { width: 300, height: 300 },
  '400x250': { width: 400, height: 250 },
};

export const LOGO_SPEC = { minWidth: 330, maxWidth: 600, height: 100, formats: ['image/png', 'image/gif'] } as const;
export const TOPBAR_HEIGHT = { min: 70, max: 100, default: 80 } as const;

/** LOGO 在顶部栏中的显示尺寸：按 H/100 等比缩放（方案「顶部栏」）。 */
export function logoDisplaySize(logoWidth: number, topbarHeight: number): { width: number; height: number } {
  const s = topbarHeight / LOGO_SPEC.height;
  return { width: Math.round(logoWidth * s), height: topbarHeight };
}

export interface SizeCheck {
  ok: boolean;
  message?: string;
}

/** 素材像素是否符合规范。iconScale=2 时要求 @2x 像素。 */
export function checkExactSize(actual: { width: number; height: number }, target: { width: number; height: number }, scale = 1): SizeCheck {
  const w = target.width * scale;
  const h = target.height * scale;
  if (actual.width === w && actual.height === h) return { ok: true };
  return { ok: false, message: `尺寸应为 ${w}×${h}px，当前为 ${actual.width}×${actual.height}px` };
}

export function checkLogoSize(actual: { width: number; height: number }): SizeCheck {
  if (actual.height !== LOGO_SPEC.height || actual.width < LOGO_SPEC.minWidth || actual.width > LOGO_SPEC.maxWidth) {
    return { ok: false, message: `LOGO 需为宽 ${LOGO_SPEC.minWidth}–${LOGO_SPEC.maxWidth}px、高 ${LOGO_SPEC.height}px，当前为 ${actual.width}×${actual.height}px` };
  }
  return { ok: true };
}
