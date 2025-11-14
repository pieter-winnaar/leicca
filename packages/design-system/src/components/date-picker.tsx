"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "../lib/utils"
import { Button } from "./button"
import { Calendar } from "./calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

export interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  className?: string
  disabledDates?: Date[]
  fromDate?: Date
  toDate?: Date
  "aria-label"?: string
  "aria-describedby"?: string
}

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      placeholder = "Pick a date",
      disabled,
      error,
      className,
      disabledDates,
      fromDate,
      toDate,
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedby,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false)

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
              error && "border-destructive",
              className
            )}
            disabled={disabled}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedby}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange?.(date)
              setOpen(false)
            }}
            disabled={[
              ...(disabledDates || []),
              ...(fromDate || toDate
                ? [
                    (date: Date) => {
                      if (fromDate && date < fromDate) return true
                      if (toDate && date > toDate) return true
                      return false
                    },
                  ]
                : []),
            ]}
          />
        </PopoverContent>
      </Popover>
    )
  }
)

DatePicker.displayName = "DatePicker"

export interface DateRangePickerProps {
  value?: { from: Date | undefined; to: Date | undefined }
  onChange?: (range: { from: Date | undefined; to: Date | undefined }) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  className?: string
  fromDate?: Date
  toDate?: Date
  "aria-label"?: string
  "aria-describedby"?: string
}

export const DateRangePicker = React.forwardRef<
  HTMLButtonElement,
  DateRangePickerProps
>(
  (
    {
      value,
      onChange,
      placeholder = "Pick a date range",
      disabled,
      error,
      className,
      fromDate,
      toDate,
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedby,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false)

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value?.from && "text-muted-foreground",
              error && "border-destructive",
              className
            )}
            disabled={disabled}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedby}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "LLL dd, y")} -{" "}
                  {format(value.to, "LLL dd, y")}
                </>
              ) : (
                format(value.from, "LLL dd, y")
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={value}
            onSelect={(range) => {
              onChange?.(range ? { from: range.from, to: range.to } : { from: undefined, to: undefined })
            }}
            disabled={
              fromDate || toDate
                ? (date: Date) => {
                    if (fromDate && date < fromDate) return true
                    if (toDate && date > toDate) return true
                    return false
                  }
                : undefined
            }
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    )
  }
)

DateRangePicker.displayName = "DateRangePicker"
