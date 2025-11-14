"use client"

import * as React from "react"
import { Check, Circle, AlertCircle, Info, Clock } from "lucide-react"
import { cn } from "../lib/utils"
import { Card } from "./card"
import { Badge } from "./badge"
import { Collapsible, CollapsibleContent } from "./collapsible"
import { Button } from "./button"

export type TimelineEventStatus = "success" | "error" | "warning" | "info" | "pending"

export interface TimelineEvent {
  id: string
  type: string
  icon?: React.ReactNode
  title: string
  timestamp: Date | string
  description?: string
  details?: React.ReactNode | string
  status?: TimelineEventStatus
  metadata?: Record<string, string | number | boolean>
}

export interface TimelineProps {
  events: TimelineEvent[]
  onEventClick?: (event: TimelineEvent) => void
  className?: string
  variant?: "default" | "compact"
  showConnector?: boolean
  "aria-label"?: string
}

// Get status color
const getStatusColor = (status?: TimelineEventStatus): string => {
  switch (status) {
    case "success":
      return "bg-green-500 border-green-500 text-green-500"
    case "error":
      return "bg-destructive border-destructive text-destructive"
    case "warning":
      return "bg-amber-500 border-amber-500 text-amber-500"
    case "info":
      return "bg-blue-500 border-blue-500 text-blue-500"
    case "pending":
      return "bg-muted-foreground border-muted-foreground text-muted-foreground"
    default:
      return "bg-primary border-primary text-primary"
  }
}

// Get status badge variant
const getStatusBadgeVariant = (status?: TimelineEventStatus): "default" | "destructive" | "outline" | "secondary" => {
  switch (status) {
    case "success":
      return "default"
    case "error":
      return "destructive"
    case "warning":
      return "secondary"
    default:
      return "outline"
  }
}

// Get default icon for status
const getDefaultIcon = (status?: TimelineEventStatus): React.ReactNode => {
  switch (status) {
    case "success":
      return <Check className="h-4 w-4" />
    case "error":
      return <AlertCircle className="h-4 w-4" />
    case "warning":
      return <AlertCircle className="h-4 w-4" />
    case "info":
      return <Info className="h-4 w-4" />
    case "pending":
      return <Clock className="h-4 w-4" />
    default:
      return <Circle className="h-3 w-3" />
  }
}

// Format timestamp
const formatTimestamp = (timestamp: Date | string): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp

  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  // Relative time for recent events
  if (seconds < 60) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  // Absolute time for older events
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  (
    {
      events,
      onEventClick,
      className,
      variant = "default",
      showConnector = true,
      "aria-label": ariaLabel = "Timeline",
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn("relative space-y-4", className)}
        role="list"
        aria-label={ariaLabel}
      >
        {events.map((event, index) => (
          <TimelineItem
            key={event.id}
            event={event}
            onEventClick={onEventClick}
            variant={variant}
            showConnector={showConnector && index < events.length - 1}
          />
        ))}
      </div>
    )
  }
)

Timeline.displayName = "Timeline"

interface TimelineItemProps {
  event: TimelineEvent
  onEventClick?: (event: TimelineEvent) => void
  variant: "default" | "compact"
  showConnector: boolean
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  event,
  onEventClick,
  variant,
  showConnector,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const statusColor = getStatusColor(event.status)
  const hasDetails = !!event.details || !!event.metadata

  const handleClick = () => {
    if (hasDetails) {
      setIsExpanded(!isExpanded)
    }
    if (onEventClick) {
      onEventClick(event)
    }
  }

  if (variant === "compact") {
    return (
      <div className="relative flex gap-3 items-start" role="listitem">
        {/* Connector Line */}
        {showConnector && (
          <div
            className="absolute left-[11px] top-[28px] h-full w-[2px] bg-border"
            aria-hidden="true"
          />
        )}

        {/* Icon */}
        <div
          className={cn(
            "relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-background",
            statusColor
          )}
        >
          {event.icon || getDefaultIcon(event.status)}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1 pb-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">{event.title}</p>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatTimestamp(event.timestamp)}
            </span>
          </div>
          {event.description && (
            <p className="text-sm text-muted-foreground">{event.description}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex gap-4 items-start" role="listitem">
      {/* Connector Line */}
      {showConnector && (
        <div
          className="absolute left-[15px] top-[40px] h-full w-[2px] bg-border"
          aria-hidden="true"
        />
      )}

      {/* Icon Container */}
      <div
        className={cn(
          "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background",
          statusColor
        )}
      >
        {event.icon || getDefaultIcon(event.status)}
      </div>

      {/* Event Card */}
      <Card
        className={cn(
          "flex-1 transition-colors",
          hasDetails && "cursor-pointer hover:bg-accent/5",
          isExpanded && "ring-2 ring-ring ring-offset-2"
        )}
        onClick={hasDetails ? handleClick : undefined}
        role={hasDetails ? "button" : undefined}
        tabIndex={hasDetails ? 0 : undefined}
        onKeyDown={
          hasDetails
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleClick()
                }
              }
            : undefined
        }
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-foreground">
                  {event.title}
                </h4>
                {event.status && (
                  <Badge variant={getStatusBadgeVariant(event.status)} className="text-xs">
                    {event.status}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {event.type} • {formatTimestamp(event.timestamp)}
              </p>
            </div>

            {hasDetails && (
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                {isExpanded ? 'Hide' : 'View'} Details
              </Button>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-sm text-muted-foreground mb-2">
              {event.description}
            </p>
          )}

          {/* Expandable Details */}
          {hasDetails && (
            <Collapsible open={isExpanded}>
              <CollapsibleContent>
                <div className="mt-3 pt-3 border-t space-y-3">
                  {/* Details Content */}
                  {event.details && (
                    <div className="text-sm text-foreground">
                      {typeof event.details === 'string' ? (
                        <p>{event.details}</p>
                      ) : (
                        event.details
                      )}
                    </div>
                  )}

                  {/* Metadata */}
                  {event.metadata && (
                    <div className="space-y-1">
                      {Object.entries(event.metadata).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-muted-foreground capitalize">
                            {key.replace(/_/g, ' ')}:
                          </span>
                          <span className="font-mono text-foreground">
                            {String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </Card>
    </div>
  )
}

TimelineItem.displayName = "TimelineItem"
