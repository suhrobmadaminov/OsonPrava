import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatPercent(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function getScoreColor(percent: number): string {
  if (percent >= 90) return 'text-duo-green';
  if (percent >= 70) return 'text-duo-yellow';
  return 'text-duo-red';
}

export function getProgressColor(percent: number): string {
  if (percent >= 90) return 'bg-duo-green';
  if (percent >= 70) return 'bg-duo-yellow';
  if (percent >= 40) return 'bg-duo-orange';
  return 'bg-duo-red';
}
