import type { ResourceDownloadOption } from './resource-download-action.props';

/** Accepts only HTTP media destinations; downloads never use navigation or a server proxy. */
export function isResourceDownloadHref(href: string): boolean {
  if (!href || href.trim() !== href || /[\u0000-\u001f\u007f\\]/.test(href)) return false;
  if (href.startsWith('//') || href.startsWith('#') || href.startsWith('?')) return false;
  try {
    const url = new URL(href, 'https://relative.invalid');
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

/** Fetches a PDF into a browser download, preserving the current page even on failure. */
export async function downloadResource(option: ResourceDownloadOption): Promise<void> {
  if (!isResourceDownloadHref(option.href)) throw new Error('Invalid resource URL');
  const response = await fetch(option.href, { credentials: 'same-origin' });
  if (!response.ok) throw new Error('Resource download failed');
  const blob = await response.blob();
  // Media endpoints may use application/octet-stream; check the PDF signature as well.
  if ((await blob.slice(0, 5).text()) !== '%PDF-') throw new Error('Resource is not a PDF');
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const urlFilename = new URL(option.href, window.location.href).pathname.split('/').pop();
  const filename = (option.filename || urlFilename || 'resource.pdf').replace(
    /[\\/\u0000-\u001f\u007f]/g,
    '_'
  );
  link.href = objectUrl;
  link.download = /\.pdf$/i.test(filename) ? filename : `${filename}.pdf`;
  link.hidden = true;
  document.body.append(link);
  try {
    link.click();
  } finally {
    link.remove();
    // Allow the browser to consume the object URL before releasing it.
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }
}
