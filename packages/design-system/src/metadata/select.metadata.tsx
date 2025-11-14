
import type { ComponentMetadata } from '../types/component.types';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectSeparator } from '../components/select';
import { CheckCircle2, XCircle, AlertCircle, Globe } from 'lucide-react';

export const selectMetadata: ComponentMetadata = {
  id: 'select',
  name: 'Select',
  description: 'Dropdown select component with keyboard navigation support',
  category: 'form',
  variants: ['default', 'disabled'],
  preview: (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3 text-foreground">Select Dropdown</h3>
        <Select>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
            <SelectItem value="option3">Option 3</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
  props: [
    {
      name: 'value',
      type: 'string',
      description: 'Controlled select value',
      required: false,
    },
    {
      name: 'onValueChange',
      type: '(value: string) => void',
      description: 'Value change handler callback',
      required: false,
    },
    {
      name: 'disabled',
      type: 'boolean',
      description: 'Disable select interaction',
      required: false,
      defaultValue: 'false'
    },
    {
      name: 'children',
      type: 'React.ReactNode',
      description: 'Select content (trigger and content)',
      required: true,
    }
  ],
  examples: [
    {
      title: 'Basic Select',
      description: 'Simple select with options',
      code: `<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>`,
      language: 'tsx',
      preview: (
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
            <SelectItem value="option3">Option 3</SelectItem>
          </SelectContent>
        </Select>
      )
    },
    {
      title: 'Disabled Select',
      description: 'Select in disabled state',
      code: `<Select disabled>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Disabled" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>`,
      language: 'tsx',
      preview: (
        <Select disabled>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Disabled" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
    },
    {
      title: 'Country Selector',
      description: 'Select with country options and flag indicators',
      code: `<Select>
  <SelectTrigger className="w-[240px]">
    <SelectValue placeholder="Select country" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="us">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4" />
        <span>United States</span>
      </div>
    </SelectItem>
    <SelectItem value="uk">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4" />
        <span>United Kingdom</span>
      </div>
    </SelectItem>
    <SelectItem value="ca">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4" />
        <span>Canada</span>
      </div>
    </SelectItem>
    <SelectItem value="au">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4" />
        <span>Australia</span>
      </div>
    </SelectItem>
    <SelectItem value="de">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4" />
        <span>Germany</span>
      </div>
    </SelectItem>
  </SelectContent>
</Select>`,
      language: 'tsx',
      preview: (
        <Select>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="us">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>United States</span>
              </div>
            </SelectItem>
            <SelectItem value="uk">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>United Kingdom</span>
              </div>
            </SelectItem>
            <SelectItem value="ca">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Canada</span>
              </div>
            </SelectItem>
            <SelectItem value="au">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Australia</span>
              </div>
            </SelectItem>
            <SelectItem value="de">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Germany</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      )
    },
    {
      title: 'Timezone Picker',
      description: 'Select with grouped options by continent',
      code: `<Select>
  <SelectTrigger className="w-[280px]">
    <SelectValue placeholder="Select timezone" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>North America</SelectLabel>
      <SelectItem value="est">Eastern Time (ET)</SelectItem>
      <SelectItem value="cst">Central Time (CT)</SelectItem>
      <SelectItem value="mst">Mountain Time (MT)</SelectItem>
      <SelectItem value="pst">Pacific Time (PT)</SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <SelectLabel>Europe</SelectLabel>
      <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
      <SelectItem value="cet">Central European Time (CET)</SelectItem>
      <SelectItem value="eet">Eastern European Time (EET)</SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <SelectLabel>Asia</SelectLabel>
      <SelectItem value="ist">India Standard Time (IST)</SelectItem>
      <SelectItem value="cst-china">China Standard Time (CST)</SelectItem>
      <SelectItem value="jst">Japan Standard Time (JST)</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>`,
      language: 'tsx',
      preview: (
        <Select>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>North America</SelectLabel>
              <SelectItem value="est">Eastern Time (ET)</SelectItem>
              <SelectItem value="cst">Central Time (CT)</SelectItem>
              <SelectItem value="mst">Mountain Time (MT)</SelectItem>
              <SelectItem value="pst">Pacific Time (PT)</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Europe</SelectLabel>
              <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
              <SelectItem value="cet">Central European Time (CET)</SelectItem>
              <SelectItem value="eet">Eastern European Time (EET)</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Asia</SelectLabel>
              <SelectItem value="ist">India Standard Time (IST)</SelectItem>
              <SelectItem value="cst-china">China Standard Time (CST)</SelectItem>
              <SelectItem value="jst">Japan Standard Time (JST)</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )
    },
    {
      title: 'With Disabled Options',
      description: 'Select with some options disabled',
      code: `<Select>
  <SelectTrigger className="w-[240px]">
    <SelectValue placeholder="Select plan" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="free">Free Plan</SelectItem>
    <SelectItem value="basic">Basic Plan - $9/mo</SelectItem>
    <SelectItem value="pro">Pro Plan - $29/mo</SelectItem>
    <SelectItem value="enterprise" disabled>
      Enterprise Plan - Contact Sales
    </SelectItem>
    <SelectItem value="custom" disabled>
      Custom Plan - Coming Soon
    </SelectItem>
  </SelectContent>
</Select>`,
      language: 'tsx',
      preview: (
        <Select>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Select plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free">Free Plan</SelectItem>
            <SelectItem value="basic">Basic Plan - $9/mo</SelectItem>
            <SelectItem value="pro">Pro Plan - $29/mo</SelectItem>
            <SelectItem value="enterprise" disabled>
              Enterprise Plan - Contact Sales
            </SelectItem>
            <SelectItem value="custom" disabled>
              Custom Plan - Coming Soon
            </SelectItem>
          </SelectContent>
        </Select>
      )
    },
    {
      title: 'With Status Icons',
      description: 'Select with icon indicators for different states',
      code: `<Select>
  <SelectTrigger className="w-[240px]">
    <SelectValue placeholder="Select status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="completed">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <span>Completed</span>
      </div>
    </SelectItem>
    <SelectItem value="in-progress">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-yellow-500" />
        <span>In Progress</span>
      </div>
    </SelectItem>
    <SelectItem value="pending">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-blue-500" />
        <span>Pending</span>
      </div>
    </SelectItem>
    <SelectItem value="failed">
      <div className="flex items-center gap-2">
        <XCircle className="h-4 w-4 text-red-500" />
        <span>Failed</span>
      </div>
    </SelectItem>
    <SelectItem value="cancelled">
      <div className="flex items-center gap-2">
        <XCircle className="h-4 w-4 text-gray-500" />
        <span>Cancelled</span>
      </div>
    </SelectItem>
  </SelectContent>
</Select>`,
      language: 'tsx',
      preview: (
        <Select>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="completed">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Completed</span>
              </div>
            </SelectItem>
            <SelectItem value="in-progress">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span>In Progress</span>
              </div>
            </SelectItem>
            <SelectItem value="pending">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <span>Pending</span>
              </div>
            </SelectItem>
            <SelectItem value="failed">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span>Failed</span>
              </div>
            </SelectItem>
            <SelectItem value="cancelled">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-gray-500" />
                <span>Cancelled</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      )
    }
  ],
  dependencies: ['react', '@radix-ui/react-select'],
  tags: ['select', 'dropdown', 'form', 'picker', 'chooser']
};
