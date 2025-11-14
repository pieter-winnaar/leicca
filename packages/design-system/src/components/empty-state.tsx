import * as React from "react"
import { Button } from "./button"
import { cn } from "../lib/utils"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Icon to display above the title
   */
  icon?: React.ReactNode;
  /**
   * Title text for the empty state
   */
  title: string;
  /**
   * Description text below the title
   */
  description?: string;
  /**
   * Primary action button
   */
  action?: {
    label: string;
    onClick: () => void;
  };
  /**
   * Secondary action button
   */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /**
   * Visual variant for different contexts
   */
  variant?: 'default' | 'search' | 'error';
  /**
   * Additional CSS classes for the container
   */
  className?: string;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon,
      title,
      description,
      action,
      secondaryAction,
      variant = 'default',
      className,
      ...props
    },
    ref
  ) => {
    const iconColorClass = {
      default: 'text-muted-foreground',
      search: 'text-muted-foreground',
      error: 'text-destructive',
    }[variant];

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center p-8 text-center",
          className
        )}
        {...props}
      >
        {icon && (
          <div className={cn("mb-4", iconColorClass)} aria-hidden="true">
            {icon}
          </div>
        )}

        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>

        {description && (
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            {description}
          </p>
        )}

        {(action || secondaryAction) && (
          <div className="flex items-center gap-3">
            {action && (
              <Button onClick={action.onClick}>{action.label}</Button>
            )}
            {secondaryAction && (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";
