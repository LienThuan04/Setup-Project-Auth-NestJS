import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  variant?: 'spinner' | 'pulse' | 'shimmer' | 'card' | 'table' | 'text';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
  lines?: number; // Cho variant 'text'
  rows?: number; // 👈 Số hàng cho table
  cols?: number; // 👈 Số cột cho table
}

export function LoadingSkeleton({ 
  variant = 'spinner', 
  size = 'md', 
  className, 
  text,
  lines = 3,
  rows = 5,
  cols = 4
}: LoadingSkeletonProps) {
  
  // 1. Spinner (giữ lại)
  if (variant === 'spinner') {
    const sizeClasses = {
      sm: 'h-4 w-4 border-2',
      md: 'h-8 w-8 border-3',
      lg: 'h-12 w-12 border-4',
    };

    return (
      <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
        <div className={cn(
          'animate-spin rounded-full border-muted-foreground/20 border-t-primary',
          sizeClasses[size]
        )} />
        {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
      </div>
    );
  }

  // 2. Pulse (block màu xám nhấp nháy)
  if (variant === 'pulse') {
    const sizeClasses = {
      sm: 'h-4 w-full',
      md: 'h-6 w-full',
      lg: 'h-10 w-full',
    };

    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'animate-pulse rounded-md bg-muted',
              sizeClasses[size],
              i === lines - 1 && 'w-3/4' // Dòng cuối ngắn hơn
            )}
          />
        ))}
      </div>
    );
  }

  // 3. Shimmer (hiệu ứng sóng)
  if (variant === 'shimmer') {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'relative overflow-hidden rounded-md bg-muted',
              size === 'sm' ? 'h-4' : size === 'md' ? 'h-6' : 'h-10',
              i === lines - 1 && 'w-3/4'
            )}
          >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        ))}
      </div>
    );
  }

  // 4. Card skeleton
  if (variant === 'card') {
    return (
      <div className={cn('rounded-xl border bg-card p-4 space-y-3', className)}>
        <div className="animate-pulse rounded-md bg-muted h-4 w-1/3" />
        <div className="animate-pulse rounded-md bg-muted h-8 w-full" />
        <div className="animate-pulse rounded-md bg-muted h-4 w-2/3" />
      </div>
    );
  }

  // 5. Table skeleton
  if (variant === 'table') {
    return (
      <div className={cn('space-y-2', className)}>
        {/* Header */}
        <div className="flex gap-4 animate-pulse">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-8 bg-muted rounded flex-1" />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="h-6 bg-muted rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // 6. Text lines
  if (variant === 'text') {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'animate-pulse rounded bg-muted',
              size === 'sm' ? 'h-3' : size === 'md' ? 'h-4' : 'h-6',
              i === lines - 1 ? 'w-2/3' : 'w-full'
            )}
          />
        ))}
      </div>
    );
  }

  return null;
}