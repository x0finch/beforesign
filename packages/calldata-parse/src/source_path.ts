/** Build a slash-separated index sourcePath for wrapper metadata. */
export function sourcePathFromSegments(...segments: number[]): string {
  return segments.join("/");
}
