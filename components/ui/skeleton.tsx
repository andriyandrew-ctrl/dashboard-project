import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('bg-muted/60 animate-pulse rounded-md', className)}
      {...props}
    />
  )
}

export { Skeleton }
