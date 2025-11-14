"use client"

import React from 'react';
import type { ComponentMetadata } from '../types/component.types';
import { DatePicker, DateRangePicker } from '../components/date-picker';
import { Label } from '../components/label';

// Preview wrapper components with state
function MainPreview() {
  const [singleDate, setSingleDate] = React.useState<Date>();
  const [dateRange, setDateRange] = React.useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>();

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="single-date">Single Date</Label>
        <DatePicker
          value={singleDate}
          onChange={setSingleDate}
          placeholder="Pick a date"
          className="w-[280px]"
        />
      </div>
      <div>
        <Label htmlFor="date-range">Date Range</Label>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          placeholder="Pick a date range"
          className="w-[280px]"
        />
      </div>
    </div>
  );
}

function BookingDatePreview() {
  const [checkInDate, setCheckInDate] = React.useState<Date>();

  return (
    <div className="space-y-2 max-w-sm">
      <Label htmlFor="check-in">Check-in Date</Label>
      <DatePicker
        value={checkInDate}
        onChange={setCheckInDate}
        placeholder="Select check-in date"
        fromDate={new Date()}
        className="w-full"
      />
      <p className="text-xs text-muted-foreground">
        Select your arrival date
      </p>
    </div>
  );
}

function ReportDateRangePreview() {
  const [dateRange, setDateRange] = React.useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>();

  return (
    <div className="space-y-2 max-w-sm">
      <Label>Report Period</Label>
      <DateRangePicker
        value={dateRange}
        onChange={setDateRange}
        placeholder="Select date range"
        toDate={new Date()}
        className="w-full"
      />
    </div>
  );
}

function BirthdayInputPreview() {
  const [birthday, setBirthday] = React.useState<Date>();

  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

  return (
    <div className="space-y-2 max-w-sm">
      <Label htmlFor="birthday">Date of Birth</Label>
      <DatePicker
        value={birthday}
        onChange={setBirthday}
        placeholder="MM/DD/YYYY"
        toDate={eighteenYearsAgo}
        className="w-full"
      />
      <p className="text-xs text-muted-foreground">
        You must be 18 or older to register
      </p>
    </div>
  );
}

function FiscalQuarterPreview() {
  const [reportRange, setReportRange] = React.useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>();

  return (
    <div className="space-y-2 max-w-sm">
      <Label>Fiscal Quarter</Label>
      <DateRangePicker
        value={reportRange}
        onChange={setReportRange}
        placeholder="Select fiscal period"
        fromDate={new Date(2024, 0, 1)}
        toDate={new Date()}
        className="w-full"
      />
      <p className="text-xs text-muted-foreground">
        Select fiscal quarter for report generation
      </p>
    </div>
  );
}

function EventSchedulerPreview() {
  const [eventDate, setEventDate] = React.useState<Date>();

  const disabledDates = [
    new Date(2024, 11, 25),
    new Date(2024, 0, 1),
    new Date(2024, 6, 4),
  ];

  return (
    <div className="space-y-2 max-w-sm">
      <Label htmlFor="event-date">Event Date</Label>
      <DatePicker
        value={eventDate}
        onChange={setEventDate}
        placeholder="Select event date"
        fromDate={new Date()}
        disabledDates={disabledDates}
        className="w-full"
      />
      <p className="text-xs text-muted-foreground">
        Holidays are unavailable for booking
      </p>
    </div>
  );
}

export const datePickerMetadata: ComponentMetadata = {
  id: 'date-picker',
  name: 'DatePicker',
  description: 'Date picker with calendar popover for selecting single dates or date ranges',
  category: 'form',
  variants: ['single', 'range'],
  preview: <MainPreview />,
  props: [
    {
      name: 'value',
      type: 'Date',
      description: 'The selected date',
      required: false,
    },
    {
      name: 'onChange',
      type: '(date: Date | undefined) => void',
      description: 'Callback when date is selected',
      required: false,
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Placeholder text when no date is selected',
      required: false,
      defaultValue: '"Pick a date"',
    },
    {
      name: 'disabled',
      type: 'boolean',
      description: 'Whether the date picker is disabled',
      required: false,
      defaultValue: 'false',
    },
    {
      name: 'error',
      type: 'string',
      description: 'Error message to display',
      required: false,
    },
    {
      name: 'disabledDates',
      type: 'Date[]',
      description: 'Array of dates to disable',
      required: false,
    },
    {
      name: 'fromDate',
      type: 'Date',
      description: 'Minimum date that can be selected',
      required: false,
    },
    {
      name: 'toDate',
      type: 'Date',
      description: 'Maximum date that can be selected',
      required: false,
    },
  ],
  examples: [
    {
      title: 'Booking Form - Check-in Date',
      description: 'Hotel check-in date picker that only allows future dates',
      code: `'use client'

import { useState } from 'react';
import { DatePicker } from '@/components/date-picker';
import { Label } from '@/components/label';

export function BookingDatePicker() {
  const [checkInDate, setCheckInDate] = useState<Date>();

  return (
    <div className="space-y-2">
      <Label htmlFor="check-in">Check-in Date</Label>
      <DatePicker
        value={checkInDate}
        onChange={setCheckInDate}
        placeholder="Select check-in date"
        fromDate={new Date()}
        className="w-full"
      />
      <p className="text-xs text-muted-foreground">
        Select your arrival date
      </p>
    </div>
  );
}`,
      language: 'tsx',
      preview: <BookingDatePreview />,
    },
    {
      title: 'Filter Panel - Date Range Filter',
      description: 'Date range picker for filtering reports and analytics data',
      code: `'use client'

import { useState } from 'react';
import { DateRangePicker } from '@/components/date-picker';
import { Label } from '@/components/label';

export function ReportDateRangeFilter() {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>();

  return (
    <div className="space-y-2">
      <Label>Report Period</Label>
      <DateRangePicker
        value={dateRange}
        onChange={setDateRange}
        placeholder="Select date range"
        toDate={new Date()}
        className="w-full"
      />
    </div>
  );
}`,
      language: 'tsx',
      preview: <ReportDateRangePreview />,
    },
    {
      title: 'Birthday Input - With Year Limit',
      description: 'Date picker for birthdays with age restrictions (must be 18+)',
      code: `'use client'

import { useState } from 'react';
import { DatePicker } from '@/components/date-picker';
import { Label } from '@/components/label';

export function BirthdayInput() {
  const [birthday, setBirthday] = useState<Date>();

  // Calculate date 18 years ago
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

  return (
    <div className="space-y-2">
      <Label htmlFor="birthday">Date of Birth</Label>
      <DatePicker
        value={birthday}
        onChange={setBirthday}
        placeholder="MM/DD/YYYY"
        toDate={eighteenYearsAgo}
        className="w-full"
      />
      <p className="text-xs text-muted-foreground">
        You must be 18 or older to register
      </p>
    </div>
  );
}`,
      language: 'tsx',
      preview: <BirthdayInputPreview />,
    },
    {
      title: 'Report Date Range - Fiscal Periods',
      description: 'Quarterly report date range selection for financial data',
      code: `'use client'

import { useState } from 'react';
import { DateRangePicker } from '@/components/date-picker';
import { Label } from '@/components/label';

export function FiscalQuarterPicker() {
  const [reportRange, setReportRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(2024, 0, 1), // Q1 start (Jan 1, 2024)
    to: new Date(2024, 2, 31),  // Q1 end (Mar 31, 2024)
  });

  return (
    <div className="space-y-2">
      <Label>Fiscal Quarter</Label>
      <DateRangePicker
        value={reportRange}
        onChange={setReportRange}
        placeholder="Select fiscal period"
        fromDate={new Date(2024, 0, 1)}
        toDate={new Date()}
        className="w-full"
      />
      <p className="text-xs text-muted-foreground">
        Select fiscal quarter for report generation
      </p>
    </div>
  );
}`,
      language: 'tsx',
      preview: <FiscalQuarterPreview />,
    },
    {
      title: 'Event Scheduler - With Disabled Dates',
      description: 'Event date picker with specific dates disabled (holidays, booked dates)',
      code: `'use client'

import { useState } from 'react';
import { DatePicker } from '@/components/date-picker';
import { Label } from '@/components/label';

export function EventScheduler() {
  const [eventDate, setEventDate] = useState<Date>();

  // Define disabled dates (holidays)
  const disabledDates = [
    new Date(2024, 11, 25), // Christmas (Dec 25, 2024)
    new Date(2024, 0, 1),   // New Year (Jan 1, 2024)
    new Date(2024, 6, 4),   // Independence Day (July 4, 2024)
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="event-date">Event Date</Label>
      <DatePicker
        value={eventDate}
        onChange={setEventDate}
        placeholder="Select event date"
        fromDate={new Date()}
        disabledDates={disabledDates}
        className="w-full"
      />
      <p className="text-xs text-muted-foreground">
        Holidays are unavailable for booking
      </p>
    </div>
  );
}`,
      language: 'tsx',
      preview: <EventSchedulerPreview />,
    },
  ],
  dependencies: ['react', 'date-fns', 'lucide-react', '@radix-ui/react-popover', 'react-day-picker'],
  tags: ['date', 'picker', 'calendar', 'form', 'input', 'range', 'booking', 'schedule'],
};
