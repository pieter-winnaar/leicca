"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "../lib/utils"
import { Button } from "./button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"

export interface ComboboxOption {
  value: string
  label: string
  icon?: React.ReactNode
}

export interface ComboboxProps {
  value?: string
  onChange?: (value: string) => void
  options: ComboboxOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
  "aria-controls"?: string
  "aria-activedescendant"?: string
}

export const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    {
      value,
      onChange,
      options,
      placeholder = "Select option...",
      searchPlaceholder = "Search...",
      emptyText = "No results found.",
      disabled = false,
      className,
      "aria-controls": ariaControls,
      "aria-activedescendant": ariaActivedescendant,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")

    const selectedOption = options.find((option) => option.value === value)

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-controls={ariaControls}
            aria-activedescendant={ariaActivedescendant}
            disabled={disabled}
            className={cn(
              "w-full justify-between",
              !value && "text-muted-foreground",
              className
            )}
          >
            <span className="flex items-center gap-2">
              {selectedOption?.icon}
              {selectedOption?.label || placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      onChange?.(currentValue === value ? "" : currentValue)
                      setOpen(false)
                    }}
                  >
                    {option.icon && (
                      <span className="mr-2">{option.icon}</span>
                    )}
                    {option.label}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }
)

Combobox.displayName = "Combobox"
