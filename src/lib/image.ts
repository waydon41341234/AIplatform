/**
 * 浏览器端图片处理：读取尺寸、按规范尺寸裁切/留边、转 data URI。
 * 规则：不静默拉伸；转换结果先给业主预览，采用后才上传。
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片无法读取'));
    img.src = src;
  });
}

export async function fileSize(file: File): Promise<{ width: number; height: number; url: string }> {
  const url = URL.createObjectURL(file);
  const img = await loadImage(url);
  return { width: img.naturalWidth, height: img.naturalHeight, url };
}

export type FitMode = 'cover' | 'contain';

/** 输出精确像素的 PNG：cover=居中裁切，contain=等比留边（透明）。 */
export async function fitTo(src: string, width: number, height: number, mode: FitMode): Promise<Blob> {
  const img = await loadImage(src);
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  const s = mode === 'cover' ? Math.max(width / img.naturalWidth, height / img.naturalHeight) : Math.min(width / img.naturalWidth, height / img.naturalHeight);
  const w = img.naturalWidth * s;
  const h = img.naturalHeight * s;
  ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
  return new Promise((r) => c.toBlob((b) => r(b!), 'image/png'));
}

/** 放大倍数超过此值时提示清晰度问题。 */
export const UPSCALE_WARN = 1.15;

export async function urlToDataUri(url: string): Promise<string> {
  const blob = await (await fetch(url)).blob();
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.readAsDataURL(blob);
  });
}

export async function svgToPng(svg: string, width: number, height: number, scale: number): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const img = await loadImage(url);
    const c = document.createElement('canvas');
    c.width = width * scale;
    c.height = height * scale;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return await new Promise((r) => c.toBlob((b) => r(b!), 'image/png'));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function download(blob: Blob, name: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
