/** Formats the verified Motion collection without inventing a CSS spring approximation. */
export function formatMotionValue(record) {
  if (record.type !== 'cubicBezier') return record.resolved;
  const points = record.resolved;
  return points.join(',') === '0,0,1,1' ? 'linear' : `cubic-bezier(${points.join(', ')})`;
}
