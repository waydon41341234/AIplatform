/** 浏览器端打包交付 zip。内容构造在 shared/export/package.ts。 */
import JSZip from 'jszip';
import type { Project } from '../../shared/project/model.ts';
import { renderHomeSvg } from '../../shared/render/svg.ts';
import { H5_CANVAS } from '../../shared/catalog/specs.ts';
import { runChecks, canDeliver } from '../../shared/project/checks.ts';
import { adoptedAssets, buildChecklist, buildManifest, buildThemeJson, type ManifestFile } from '../../shared/export/package.ts';
import { svgToPng, urlToDataUri } from './image.ts';

export interface ExportOptions {
  png1x: boolean;
  png2x: boolean;
  svg: boolean;
  assets: boolean;
  data: boolean;
  states: ('loggedOut' | 'loggedIn')[];
}

/** 把页面里引用的素材全部内嵌为 data URI，保证 SVG/PNG 可独立打开。 */
export async function selfContainedSvg(p: Project): Promise<string> {
  const map = new Map<string, string>();
  await Promise.all(p.assets.map(async (a) => map.set(a.url, await urlToDataUri(a.url).catch(() => a.url))));
  return renderHomeSvg(p, { resolveAsset: (u) => map.get(u) ?? u });
}

export async function buildZip(p: Project, o: ExportOptions): Promise<{ blob: Blob; draft: boolean }> {
  const zip = new JSZip();
  const files: ManifestFile[] = [];
  const W = H5_CANVAS.width;
  const H = p.pages.home.height;
  for (const st of o.states) {
    const variant: Project = structuredClone(p);
    variant.pages.home.preview = { loggedIn: st === 'loggedIn', sidebarOpen: false };
    const svg = await selfContainedSvg(variant);
    const base = `pages/h5/home-${st === 'loggedIn' ? 'logged-in' : 'logged-out'}`;
    if (o.svg) { zip.file(`${base}.svg`, svg); files.push({ path: `${base}.svg`, format: 'svg', pixelWidth: W, pixelHeight: H, source: 'render' }); }
    if (o.png1x) { zip.file(`${base}.png`, await svgToPng(svg, W, H, 1)); files.push({ path: `${base}.png`, format: 'png', pixelWidth: W, pixelHeight: H, source: 'render' }); }
    if (o.png2x) { zip.file(`${base}@2x.png`, await svgToPng(svg, W, H, 2)); files.push({ path: `${base}@2x.png`, format: 'png', pixelWidth: W * 2, pixelHeight: H * 2, logicalWidth: W, logicalHeight: H, scale: 2, source: 'render' }); }
  }
  if (o.assets) {
    for (const a of adoptedAssets(p)) {
      zip.file(a.path, await (await fetch(a.asset.url)).blob());
      files.push({ path: a.path, ...a.file });
    }
  }
  const issues = runChecks(p);
  if (o.data) {
    zip.file('theme.json', JSON.stringify(buildThemeJson(p), null, 2));
    zip.file('project.json', JSON.stringify(p, null, 2));
  }
  zip.file('delivery-checklist.md', buildChecklist(p, issues));
  zip.file('manifest.json', JSON.stringify(buildManifest(p, files), null, 2));
  return { blob: await zip.generateAsync({ type: 'blob' }), draft: !canDeliver(issues) };
}
