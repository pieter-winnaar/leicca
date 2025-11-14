import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '../command'

describe('Command', () => {
  it('should render command component', () => {
    render(
      <Command>
        <CommandInput placeholder="Type a command..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>Item 1</CommandItem>
            <CommandItem>Item 2</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    )

    expect(screen.getByPlaceholderText('Type a command...')).toBeInTheDocument()
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  it('should handle input interaction', () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Search Emoji</CommandItem>
            <CommandItem>Calculator</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    )

    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'cal' } })

    expect(input).toHaveValue('cal')
  })

  it('should handle item selection', () => {
    const handleSelect = vi.fn()

    render(
      <Command>
        <CommandInput />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            <CommandItem onSelect={handleSelect}>Calendar</CommandItem>
            <CommandItem onSelect={handleSelect}>Calculator</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    )

    const calendarItem = screen.getByText('Calendar')
    fireEvent.click(calendarItem)

    expect(handleSelect).toHaveBeenCalledTimes(1)
  })

  it('should display empty state when no results', () => {
    render(
      <Command>
        <CommandInput />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {/* No items */}
          </CommandGroup>
        </CommandList>
      </Command>
    )

    expect(screen.getByText('No results found.')).toBeInTheDocument()
  })
})
