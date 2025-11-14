"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "../lib/utils"
import { Progress } from "./progress"

export type StepStatus = "pending" | "current" | "completed" | "error"

export interface Step {
  id: string
  label: string
  description?: string
  status?: StepStatus
  optional?: boolean
}

export interface StepperProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (step: number) => void
  variant?: "default" | "compact"
  orientation?: "horizontal" | "vertical"
  showProgress?: boolean
  allowClickableSteps?: boolean
  className?: string
  "aria-label"?: string
}

export const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      steps,
      currentStep,
      onStepClick,
      variant = "default",
      orientation = "horizontal",
      showProgress = true,
      allowClickableSteps = false,
      className,
      "aria-label": ariaLabel = "Progress steps",
    },
    ref
  ) => {
    // Calculate progress percentage
    const totalSteps = steps.length
    const completedSteps = steps.filter((step, index) => {
      const status = getStepStatus(step, index, currentStep)
      return status === "completed"
    }).length

    const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

    // Determine step status based on current step
    const getStepStatusValue = (stepIndex: number): StepStatus => {
      if (stepIndex < currentStep) return "completed"
      if (stepIndex === currentStep) return "current"
      return "pending"
    }

    return (
      <div ref={ref} className={cn("w-full", className)}>
        {/* Progress Bar */}
        {showProgress && (
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span className="text-muted-foreground">
                {Math.round(progressPercentage)}% Complete
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {/* Steps */}
        <div
          className={cn(
            "flex",
            orientation === "horizontal" ? "flex-row items-start" : "flex-col",
            orientation === "horizontal" && variant === "compact" && "items-center"
          )}
          role="list"
          aria-label={ariaLabel}
        >
          {steps.map((step, index) => {
            const status = step.status || getStepStatusValue(index)
            const isLast = index === steps.length - 1
            const isClickable = allowClickableSteps && status !== "pending" && onStepClick

            return (
              <React.Fragment key={step.id}>
                <StepItem
                  step={step}
                  index={index}
                  status={status}
                  variant={variant}
                  orientation={orientation}
                  isClickable={!!isClickable}
                  onClick={() => isClickable && onStepClick(index)}
                />
                {!isLast && (
                  <StepConnector
                    status={status}
                    orientation={orientation}
                    variant={variant}
                  />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    )
  }
)

Stepper.displayName = "Stepper"

// Helper function to get step status
function getStepStatus(step: Step, index: number, currentStep: number): StepStatus {
  if (step.status) return step.status
  if (index < currentStep) return "completed"
  if (index === currentStep) return "current"
  return "pending"
}

// Step Item Component
interface StepItemProps {
  step: Step
  index: number
  status: StepStatus
  variant: "default" | "compact"
  orientation: "horizontal" | "vertical"
  isClickable: boolean
  onClick: () => void
}

const StepItem: React.FC<StepItemProps> = ({
  step,
  index,
  status,
  variant,
  orientation,
  isClickable,
  onClick,
}) => {
  const getStatusStyles = () => {
    switch (status) {
      case "completed":
        return "bg-primary border-primary text-primary-foreground"
      case "current":
        return "bg-primary border-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
      case "error":
        return "bg-destructive border-destructive text-destructive-foreground"
      case "pending":
      default:
        return "bg-background border-border text-muted-foreground"
    }
  }

  const Element = isClickable ? "button" : "div"

  return (
    <div
      className={cn(
        "flex",
        orientation === "horizontal" ? "flex-col items-center" : "flex-row items-start",
        orientation === "horizontal" && "min-w-[120px]",
        orientation === "vertical" && "w-full"
      )}
      role="listitem"
    >
      <Element
        type={isClickable ? "button" : undefined}
        className={cn(
          "flex items-center justify-center rounded-full border-2 font-semibold transition-all",
          variant === "compact" ? "h-8 w-8 text-sm" : "h-10 w-10 text-base",
          getStatusStyles(),
          isClickable && "cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          !isClickable && "cursor-default"
        )}
        onClick={isClickable ? onClick : undefined}
        aria-label={`Step ${index + 1}: ${step.label}`}
        aria-current={status === "current" ? "step" : undefined}
        disabled={!isClickable}
      >
        {status === "completed" ? (
          <Check className={cn(variant === "compact" ? "h-4 w-4" : "h-5 w-5")} />
        ) : (
          <span>{index + 1}</span>
        )}
      </Element>

      {variant === "default" && (
        <div
          className={cn(
            "space-y-1",
            orientation === "horizontal" ? "mt-2 text-center" : "ml-4 flex-1"
          )}
        >
          <p
            className={cn(
              "font-medium transition-colors text-sm",
              status === "current" && "text-foreground",
              status === "completed" && "text-foreground",
              status === "pending" && "text-muted-foreground",
              status === "error" && "text-destructive"
            )}
          >
            {step.label}
            {step.optional && (
              <span className="ml-1 text-xs text-muted-foreground">(optional)</span>
            )}
          </p>
          {step.description && (
            <p
              className={cn(
                "text-xs text-muted-foreground",
                orientation === "horizontal" && "max-w-[140px]"
              )}
            >
              {step.description}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

StepItem.displayName = "StepItem"

// Step Connector Component
interface StepConnectorProps {
  status: StepStatus
  orientation: "horizontal" | "vertical"
  variant: "default" | "compact"
}

const StepConnector: React.FC<StepConnectorProps> = ({
  status,
  orientation,
  variant,
}) => {
  const isCompleted = status === "completed"

  return (
    <div
      className={cn(
        "flex-shrink-0",
        orientation === "horizontal"
          ? cn(
              "h-[2px] self-start",
              variant === "compact" ? "w-8 mt-4" : "w-12 mt-5"
            )
          : cn("w-[2px] ml-4", variant === "compact" ? "h-6" : "h-12"),
        isCompleted ? "bg-primary" : "bg-border"
      )}
      aria-hidden="true"
    />
  )
}

StepConnector.displayName = "StepConnector"
