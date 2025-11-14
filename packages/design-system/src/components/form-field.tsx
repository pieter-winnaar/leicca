import * as React from "react"
import { Label } from "./label"
import { cn } from "../lib/utils"

export interface FormFieldProps {
  /**
   * Label text for the form field
   */
  label: string;
  /**
   * Error message to display below the input
   */
  error?: string;
  /**
   * Helper text to display below the input (shown when no error)
   */
  helperText?: string;
  /**
   * Whether the field is required (displays red asterisk)
   */
  required?: boolean;
  /**
   * The form input element (Input, Textarea, Select, etc.)
   */
  children: React.ReactElement;
  /**
   * Additional CSS classes for the container
   */
  className?: string;
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, helperText, required, children, className }, ref) => {
    // Generate unique IDs for accessibility
    const id = React.useId();
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    // Clone the child element and add accessibility attributes
    const childProps = children.props as any;
    const enhancedChild = React.cloneElement(children, {
      id: childProps.id || id,
      'aria-invalid': error ? 'true' : undefined,
      'aria-describedby': error
        ? errorId
        : helperText
        ? helperId
        : undefined,
      'aria-required': required ? 'true' : undefined,
      // Apply error styling by appending to existing className
      className: error
        ? cn(childProps.className, 'border-destructive focus-visible:ring-destructive')
        : childProps.className,
    } as React.HTMLAttributes<HTMLElement>);

    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        <Label htmlFor={childProps.id || id}>
          {label}
          {required && (
            <span className="text-destructive ml-1" aria-label="required">
              *
            </span>
          )}
        </Label>

        {enhancedChild}

        {error && (
          <p
            id={errorId}
            className="text-sm font-medium text-destructive"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            id={helperId}
            className="text-sm text-muted-foreground"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";
