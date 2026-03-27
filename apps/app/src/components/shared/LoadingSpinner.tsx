import { cn } from '@/lib/utils';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className }: Props) {
  const sizeClasses = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'border-4 border-duo-green border-t-transparent rounded-full animate-spin',
          sizeClasses[size],
        )}
      />
    </div>
  );
}
