const markdownExtensionRe = /\.md$/;

/** Normalize internal API doc URLs for case-sensitive static hosting. */
export function normalizeApiDocLink(url: string): string | null {
  if (!url.startsWith('/docs/api/')) {
    return null;
  }

  const [path, hash] = url.split('#');
  const normalizedPath = path.replace(markdownExtensionRe, '').toLowerCase();
  return hash ? `${normalizedPath}#${hash}` : normalizedPath;
}
