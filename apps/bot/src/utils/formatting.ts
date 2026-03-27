export function formatQuestion(num: number, total: number, text: string): string {
  return `📝 <b>Savol ${num}/${total}</b>\n\n${text}`;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function formatPercent(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export function getProgressBar(percent: number, length = 10): string {
  const filled = Math.round((percent / 100) * length);
  const empty = length - filled;
  return '▓'.repeat(filled) + '░'.repeat(empty);
}
