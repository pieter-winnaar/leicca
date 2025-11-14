/**
 * Calendar Card Component Metadata
 */

import { ComponentMetadata } from '../types/component.types';
import { CalendarCard } from '../components/CalendarCard';

export const calendarCardMetadata: ComponentMetadata = {
  id: 'calendar-card',
  name: 'Calendar Card',
  description: 'Interactive calendar card for date selection with month navigation',
  category: 'data-display',
  variants: ['default', 'with-selection'],
  preview: (
    <CalendarCard
      title="Calendar"
      selectedDates={[5, 13]}
      month={5}
      year={2025}
    />
  ),
  props: [
    {
      name: 'title',
      type: 'string',
      defaultValue: 'Calendar',
      description: 'Card title displayed at the top',
      required: false,
    },
    {
      name: 'selectedDates',
      type: 'number[]',
      defaultValue: '[]',
      description: 'Array of selected date numbers',
      required: false,
    },
    {
      name: 'onDateSelect',
      type: '(date: number) => void',
      description: 'Callback when a date is selected',
      required: false,
    },
    {
      name: 'month',
      type: 'number',
      description: 'Current month (0-11, default: current month)',
      required: false,
    },
    {
      name: 'year',
      type: 'number',
      description: 'Current year (default: current year)',
      required: false,
    },
    {
      name: 'onMonthChange',
      type: '(month: number, year: number) => void',
      description: 'Callback when month changes',
      required: false,
    },
  ],
  examples: [
    {
      title: 'Interactive Calendar',
      description: 'Calendar with date selection',
      code: `<CalendarCard
  title="Calendar"
  selectedDates={[5, 13]}
  onDateSelect={(date) => console.log('Selected:', date)}
  month={5}
  year={2025}
/>`,
      language: 'tsx',
      preview: (
        <CalendarCard
          title="Calendar"
          selectedDates={[5, 13]}
          month={5}
          year={2025}
        />
      ),
    },
  ],
  dependencies: ['react', 'lucide-react'],
  tags: ['calendar', 'date', 'selection', 'card', 'interactive'],
};
