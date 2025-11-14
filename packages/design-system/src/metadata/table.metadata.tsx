
import type { ComponentMetadata } from '../types/component.types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/table';
import { Checkbox } from '../components/checkbox';
import { Button } from '../components/button';
import { ArrowUpDown, Loader2 } from 'lucide-react';

export const tableMetadata: ComponentMetadata = {
  id: 'table',
  name: 'Table',
  description: 'A responsive table component with header, body, and footer support',
  category: 'display',
  variants: ['default'],
  preview: (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">John Doe</TableCell>
            <TableCell>john@example.com</TableCell>
            <TableCell>Developer</TableCell>
            <TableCell className="text-right">Active</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Jane Smith</TableCell>
            <TableCell>jane@example.com</TableCell>
            <TableCell>Designer</TableCell>
            <TableCell className="text-right">Active</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Bob Johnson</TableCell>
            <TableCell>bob@example.com</TableCell>
            <TableCell>Manager</TableCell>
            <TableCell className="text-right">Away</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
  props: [
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS classes',
      required: false,
    }
  ],
  examples: [
    {
      title: 'Basic Table',
      description: 'A simple table with header and data rows',
      code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Role</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
      <TableCell>Developer</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>Jane Smith</TableCell>
      <TableCell>jane@example.com</TableCell>
      <TableCell>Designer</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
      language: 'tsx'
    },
    {
      title: 'Table with Footer',
      description: 'Table with footer row for totals or summary',
      code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Item</TableHead>
      <TableHead>Quantity</TableHead>
      <TableHead>Price</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Product A</TableCell>
      <TableCell>2</TableCell>
      <TableCell>$20</TableCell>
    </TableRow>
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell>Total</TableCell>
      <TableCell>2</TableCell>
      <TableCell>$20</TableCell>
    </TableRow>
  </TableFooter>
</Table>`,
      language: 'tsx'
    },
    {
      title: 'Sortable Columns',
      description: 'Table with sortable column headers',
      code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>
        <Button variant="ghost" size="sm" className="h-8 -ml-3">
          Name <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </TableHead>
      <TableHead>
        <Button variant="ghost" size="sm" className="h-8 -ml-3">
          Amount <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </TableHead>
      <TableHead>
        <Button variant="ghost" size="sm" className="h-8 -ml-3">
          Status <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">Transaction A</TableCell>
      <TableCell>$250.00</TableCell>
      <TableCell>Completed</TableCell>
    </TableRow>
    <TableRow>
      <TableCell className="font-medium">Transaction B</TableCell>
      <TableCell>$150.00</TableCell>
      <TableCell>Pending</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
      language: 'tsx',
      preview: (
        <div className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" size="sm" className="h-8 -ml-3">
                    Name <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" className="h-8 -ml-3">
                    Amount <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" className="h-8 -ml-3">
                    Status <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Transaction A</TableCell>
                <TableCell>$250.00</TableCell>
                <TableCell>Completed</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Transaction B</TableCell>
                <TableCell>$150.00</TableCell>
                <TableCell>Pending</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Transaction C</TableCell>
                <TableCell>$350.00</TableCell>
                <TableCell>Completed</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )
    },
    {
      title: 'Striped Rows',
      description: 'Table with alternating row backgrounds for better readability',
      code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Invoice</TableHead>
      <TableHead>Client</TableHead>
      <TableHead>Amount</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="bg-muted/50">
      <TableCell className="font-medium">INV001</TableCell>
      <TableCell>Acme Corp</TableCell>
      <TableCell>$1,250.00</TableCell>
      <TableCell>Paid</TableCell>
    </TableRow>
    <TableRow>
      <TableCell className="font-medium">INV002</TableCell>
      <TableCell>Globex Inc</TableCell>
      <TableCell>$2,500.00</TableCell>
      <TableCell>Pending</TableCell>
    </TableRow>
    <TableRow className="bg-muted/50">
      <TableCell className="font-medium">INV003</TableCell>
      <TableCell>Stark Industries</TableCell>
      <TableCell>$3,750.00</TableCell>
      <TableCell>Paid</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
      language: 'tsx',
      preview: (
        <div className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-muted/50">
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Acme Corp</TableCell>
                <TableCell>$1,250.00</TableCell>
                <TableCell>Paid</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">INV002</TableCell>
                <TableCell>Globex Inc</TableCell>
                <TableCell>$2,500.00</TableCell>
                <TableCell>Pending</TableCell>
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell className="font-medium">INV003</TableCell>
                <TableCell>Stark Industries</TableCell>
                <TableCell>$3,750.00</TableCell>
                <TableCell>Paid</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )
    },
    {
      title: 'Row Selection',
      description: 'Table with selectable rows using checkboxes',
      code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[50px]">
        <Checkbox aria-label="Select all" />
      </TableHead>
      <TableHead>Task</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Priority</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>
        <Checkbox aria-label="Select row" />
      </TableCell>
      <TableCell className="font-medium">Implement user authentication</TableCell>
      <TableCell>In Progress</TableCell>
      <TableCell>High</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>
        <Checkbox aria-label="Select row" />
      </TableCell>
      <TableCell className="font-medium">Design landing page</TableCell>
      <TableCell>Completed</TableCell>
      <TableCell>Medium</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>
        <Checkbox aria-label="Select row" />
      </TableCell>
      <TableCell className="font-medium">Write documentation</TableCell>
      <TableCell>Todo</TableCell>
      <TableCell>Low</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
      language: 'tsx',
      preview: (
        <div className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox aria-label="Select all" />
                </TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Checkbox aria-label="Select row" />
                </TableCell>
                <TableCell className="font-medium">Implement user authentication</TableCell>
                <TableCell>In Progress</TableCell>
                <TableCell>High</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Checkbox aria-label="Select row" />
                </TableCell>
                <TableCell className="font-medium">Design landing page</TableCell>
                <TableCell>Completed</TableCell>
                <TableCell>Medium</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Checkbox aria-label="Select row" />
                </TableCell>
                <TableCell className="font-medium">Write documentation</TableCell>
                <TableCell>Todo</TableCell>
                <TableCell>Low</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )
    },
    {
      title: 'Compact Variant',
      description: 'Dense table layout for displaying more data in less space',
      code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="h-8 px-2 text-xs">ID</TableHead>
      <TableHead className="h-8 px-2 text-xs">Name</TableHead>
      <TableHead className="h-8 px-2 text-xs">Type</TableHead>
      <TableHead className="h-8 px-2 text-xs">Size</TableHead>
      <TableHead className="h-8 px-2 text-xs">Modified</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="h-8">
      <TableCell className="px-2 py-1 text-xs">1</TableCell>
      <TableCell className="px-2 py-1 text-xs font-medium">report.pdf</TableCell>
      <TableCell className="px-2 py-1 text-xs">PDF</TableCell>
      <TableCell className="px-2 py-1 text-xs">2.4 MB</TableCell>
      <TableCell className="px-2 py-1 text-xs">2024-01-15</TableCell>
    </TableRow>
    <TableRow className="h-8">
      <TableCell className="px-2 py-1 text-xs">2</TableCell>
      <TableCell className="px-2 py-1 text-xs font-medium">data.csv</TableCell>
      <TableCell className="px-2 py-1 text-xs">CSV</TableCell>
      <TableCell className="px-2 py-1 text-xs">156 KB</TableCell>
      <TableCell className="px-2 py-1 text-xs">2024-01-14</TableCell>
    </TableRow>
    <TableRow className="h-8">
      <TableCell className="px-2 py-1 text-xs">3</TableCell>
      <TableCell className="px-2 py-1 text-xs font-medium">image.png</TableCell>
      <TableCell className="px-2 py-1 text-xs">PNG</TableCell>
      <TableCell className="px-2 py-1 text-xs">892 KB</TableCell>
      <TableCell className="px-2 py-1 text-xs">2024-01-13</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
      language: 'tsx',
      preview: (
        <div className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-8 px-2 text-xs">ID</TableHead>
                <TableHead className="h-8 px-2 text-xs">Name</TableHead>
                <TableHead className="h-8 px-2 text-xs">Type</TableHead>
                <TableHead className="h-8 px-2 text-xs">Size</TableHead>
                <TableHead className="h-8 px-2 text-xs">Modified</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="h-8">
                <TableCell className="px-2 py-1 text-xs">1</TableCell>
                <TableCell className="px-2 py-1 text-xs font-medium">report.pdf</TableCell>
                <TableCell className="px-2 py-1 text-xs">PDF</TableCell>
                <TableCell className="px-2 py-1 text-xs">2.4 MB</TableCell>
                <TableCell className="px-2 py-1 text-xs">2024-01-15</TableCell>
              </TableRow>
              <TableRow className="h-8">
                <TableCell className="px-2 py-1 text-xs">2</TableCell>
                <TableCell className="px-2 py-1 text-xs font-medium">data.csv</TableCell>
                <TableCell className="px-2 py-1 text-xs">CSV</TableCell>
                <TableCell className="px-2 py-1 text-xs">156 KB</TableCell>
                <TableCell className="px-2 py-1 text-xs">2024-01-14</TableCell>
              </TableRow>
              <TableRow className="h-8">
                <TableCell className="px-2 py-1 text-xs">3</TableCell>
                <TableCell className="px-2 py-1 text-xs font-medium">image.png</TableCell>
                <TableCell className="px-2 py-1 text-xs">PNG</TableCell>
                <TableCell className="px-2 py-1 text-xs">892 KB</TableCell>
                <TableCell className="px-2 py-1 text-xs">2024-01-13</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )
    },
    {
      title: 'Loading State',
      description: 'Table with loading indicator while data is being fetched',
      code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Order ID</TableHead>
      <TableHead>Customer</TableHead>
      <TableHead>Total</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell colSpan={4} className="h-24 text-center">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading orders...</span>
        </div>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>`,
      language: 'tsx',
      preview: (
        <div className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-muted-foreground">Loading orders...</span>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )
    },
    {
      title: 'Empty State',
      description: 'Table showing message when no data is available',
      code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Transaction ID</TableHead>
      <TableHead>Date</TableHead>
      <TableHead>Amount</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell colSpan={4} className="h-24 text-center">
        <div className="flex flex-col items-center justify-center space-y-2">
          <p className="text-muted-foreground">No transactions found</p>
          <p className="text-sm text-muted-foreground">
            Start by creating your first transaction
          </p>
        </div>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>`,
      language: 'tsx',
      preview: (
        <div className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <p className="text-muted-foreground">No transactions found</p>
                    <p className="text-sm text-muted-foreground">
                      Start by creating your first transaction
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )
    }
  ],
  dependencies: ['react'],
  tags: ['table', 'data', 'grid', 'display']
};
