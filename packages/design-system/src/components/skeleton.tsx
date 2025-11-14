import { cn } from "../lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton rounded-md bg-muted", className)}
      role="status"
      aria-label="Loading..."
      {...props}
    />
  )
}

export { Skeleton }
