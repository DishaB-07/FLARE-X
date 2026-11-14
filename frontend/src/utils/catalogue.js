/** Derived view data. Kept out of React components for easier testing. */
export function catalogueTopics(records) {
  return [...new Set(records.flatMap((record) => record.topic_tags || []))].sort();
}
export function typeChartData(metadata) {
  return Object.entries(metadata?.type_counts || {}).map(([name, value]) => ({ name: name.replace(' Investigation', ''), value }));
}
export function topicChartData(records) {
  const counts = new Map();
  records.forEach((record) => (record.topic_tags || []).forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1)));
  return [...counts.entries()].map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count).slice(0, 7);
}
