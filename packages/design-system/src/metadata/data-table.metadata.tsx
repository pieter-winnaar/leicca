import type { ComponentMetadata } from '../types/component.types';
import { DataTable } from '../components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Checkbox } from '../components/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../components/dropdown-menu';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';

// Types for examples
type Payment = {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  email: string;
  date: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  status: 'active' | 'inactive';
};

type Transaction = {
  id: string;
  txid: string;
  amount: number;
  type: 'send' | 'receive';
  timestamp: number;
  confirmations: number;
};

type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  stock: number;
  reorderPoint: number;
  price: number;
};

type AnalyticsData = {
  id: string;
  metric: string;
  value: number;
  change: number;
  trend: number[];
};

type Order = {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
};

// Example 1: Payments Table
const paymentsData: Payment[] = [
  {
    id: '1',
    amount: 125.5,
    status: 'success',
    email: 'alice@example.com',
    date: '2024-01-15',
  },
  {
    id: '2',
    amount: 89.99,
    status: 'processing',
    email: 'bob@example.com',
    date: '2024-01-14',
  },
  {
    id: '3',
    amount: 250.0,
    status: 'failed',
    email: 'charlie@example.com',
    date: '2024-01-13',
  },
  {
    id: '4',
    amount: 45.75,
    status: 'pending',
    email: 'diana@example.com',
    date: '2024-01-12',
  },
  {
    id: '5',
    amount: 310.25,
    status: 'success',
    email: 'edward@example.com',
    date: '2024-01-11',
  },
];

const paymentsColumns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const variant =
        status === 'success'
          ? 'default'
          : status === 'processing'
          ? 'secondary'
          : status === 'failed'
          ? 'destructive'
          : 'outline';
      return (
        <Badge variant={variant as any} className="capitalize">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'date',
    header: 'Date',
  },
];

// Example 2: User Management with Row Selection
const usersData: User[] = [
  { id: '1', name: 'Alice Smith', email: 'alice@example.com', role: 'admin', status: 'active' },
  { id: '2', name: 'Bob Johnson', email: 'bob@example.com', role: 'user', status: 'active' },
  { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'user', status: 'inactive' },
  { id: '4', name: 'Diana Prince', email: 'diana@example.com', role: 'guest', status: 'active' },
];

const usersColumns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      return <Badge variant="secondary" className="capitalize">{role}</Badge>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge variant={status === 'active' ? 'default' : 'outline'} className="capitalize">
          {status}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Edit user</DropdownMenuItem>
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete user</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Example 3: Transaction History
const transactionsData: Transaction[] = [
  { id: '1', txid: 'a1b2c3d4e5f6', amount: 0.05, type: 'receive', timestamp: 1704067200000, confirmations: 12 },
  { id: '2', txid: 'f6e5d4c3b2a1', amount: 0.02, type: 'send', timestamp: 1704066000000, confirmations: 8 },
  { id: '3', txid: 'g7h8i9j0k1l2', amount: 0.1, type: 'receive', timestamp: 1704064800000, confirmations: 25 },
];

const transactionsColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'txid',
    header: 'Transaction ID',
    cell: ({ row }) => {
      const txid = row.getValue('txid') as string;
      return <code className="text-xs">{txid.substring(0, 12)}...</code>;
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      return (
        <Badge variant={type === 'receive' ? 'default' : 'secondary'} className="capitalize">
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">Amount (BSV)</div>,
    cell: ({ row }) => {
      const amount = row.getValue('amount') as number;
      return <div className="text-right font-mono">{amount.toFixed(8)}</div>;
    },
  },
  {
    accessorKey: 'confirmations',
    header: 'Confirmations',
  },
  {
    accessorKey: 'timestamp',
    header: 'Date',
    cell: ({ row }) => {
      const timestamp = row.getValue('timestamp') as number;
      return new Date(timestamp).toLocaleDateString();
    },
  },
];

// Example 4: Inventory Table with Stock Highlighting
const inventoryData: InventoryItem[] = [
  { id: '1', sku: 'WID-001', name: 'Widget A', stock: 150, reorderPoint: 50, price: 29.99 },
  { id: '2', sku: 'WID-002', name: 'Widget B', stock: 25, reorderPoint: 50, price: 39.99 },
  { id: '3', sku: 'GAD-001', name: 'Gadget X', stock: 5, reorderPoint: 20, price: 99.99 },
  { id: '4', sku: 'GAD-002', name: 'Gadget Y', stock: 200, reorderPoint: 75, price: 149.99 },
];

const inventoryColumns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: 'sku',
    header: 'SKU',
  },
  {
    accessorKey: 'name',
    header: 'Product Name',
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
    cell: ({ row }) => {
      const stock = row.getValue('stock') as number;
      const reorderPoint = row.original.reorderPoint;
      const isLow = stock < reorderPoint;
      return (
        <div className={isLow ? 'text-destructive font-semibold' : ''}>
          {stock} {isLow && '⚠️'}
        </div>
      );
    },
  },
  {
    accessorKey: 'reorderPoint',
    header: 'Reorder Point',
  },
  {
    accessorKey: 'price',
    header: () => <div className="text-right">Price</div>,
    cell: ({ row }) => {
      const price = row.getValue('price') as number;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(price);
      return <div className="text-right">{formatted}</div>;
    },
  },
];

// Example 5: Analytics Table with Metrics
const analyticsData: AnalyticsData[] = [
  { id: '1', metric: 'Total Users', value: 12450, change: 12.5, trend: [100, 110, 105, 120, 115, 125] },
  { id: '2', metric: 'Revenue', value: 45800, change: 8.3, trend: [400, 420, 410, 445, 430, 458] },
  { id: '3', metric: 'Conversions', value: 892, change: -2.4, trend: [90, 88, 92, 89, 87, 89] },
  { id: '4', metric: 'Page Views', value: 98765, change: 15.7, trend: [800, 850, 900, 920, 950, 988] },
];

const analyticsColumns: ColumnDef<AnalyticsData>[] = [
  {
    accessorKey: 'metric',
    header: 'Metric',
  },
  {
    accessorKey: 'value',
    header: () => <div className="text-right">Value</div>,
    cell: ({ row }) => {
      const value = row.getValue('value') as number;
      const formatted = new Intl.NumberFormat('en-US').format(value);
      return <div className="text-right font-mono">{formatted}</div>;
    },
  },
  {
    accessorKey: 'change',
    header: () => <div className="text-right">Change (%)</div>,
    cell: ({ row }) => {
      const change = row.getValue('change') as number;
      const isPositive = change > 0;
      return (
        <div
          className={`text-right font-semibold ${
            isPositive ? 'text-green-600' : 'text-destructive'
          }`}
        >
          {isPositive ? '+' : ''}
          {change.toFixed(1)}%
        </div>
      );
    },
  },
  {
    accessorKey: 'trend',
    header: 'Trend',
    cell: ({ row }) => {
      const trend = row.getValue('trend') as number[];
      const max = Math.max(...trend);
      const min = Math.min(...trend);
      return (
        <div className="flex items-end space-x-1 h-8">
          {trend.map((value, i) => {
            const height = ((value - min) / (max - min)) * 100;
            return (
              <div
                key={i}
                className="w-2 bg-primary rounded-t"
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
      );
    },
  },
];

// Example 6: Order Management
const ordersData: Order[] = [
  { id: '1', orderNumber: 'ORD-2024-001', customer: 'Alice Smith', total: 289.99, status: 'delivered', date: '2024-01-10' },
  { id: '2', orderNumber: 'ORD-2024-002', customer: 'Bob Johnson', total: 149.50, status: 'shipped', date: '2024-01-12' },
  { id: '3', orderNumber: 'ORD-2024-003', customer: 'Charlie Brown', total: 499.99, status: 'processing', date: '2024-01-14' },
  { id: '4', orderNumber: 'ORD-2024-004', customer: 'Diana Prince', total: 89.95, status: 'pending', date: '2024-01-15' },
];

const ordersColumns: ColumnDef<Order>[] = [
  {
    accessorKey: 'orderNumber',
    header: 'Order #',
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
  },
  {
    accessorKey: 'total',
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => {
      const total = row.getValue('total') as number;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(total);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const variant =
        status === 'delivered'
          ? 'default'
          : status === 'shipped'
          ? 'secondary'
          : status === 'processing'
          ? 'outline'
          : status === 'pending'
          ? 'secondary'
          : 'destructive';
      return (
        <Badge variant={variant as any} className="capitalize">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'date',
    header: 'Date',
  },
  {
    id: 'actions',
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>View order</DropdownMenuItem>
            <DropdownMenuItem>Edit order</DropdownMenuItem>
            <DropdownMenuItem>Track shipment</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Cancel order</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export const dataTableMetadata: ComponentMetadata = {
  id: 'data-table',
  name: 'DataTable',
  description:
    'A powerful and flexible data table built on TanStack Table with support for sorting, pagination, row selection, and column visibility.',
  category: 'data-display',
  tags: ['table', 'data', 'grid', 'sorting', 'pagination', 'selection'],
  preview: (
    <DataTable
      columns={paymentsColumns}
      data={paymentsData}
      enableSorting={true}
      enablePagination={true}
      pageSize={5}
    />
  ),
  props: [
    {
      name: 'columns',
      type: 'ColumnDef<TData, TValue>[]',
      description: 'Array of column definitions for the table',
      required: true,
    },
    {
      name: 'data',
      type: 'TData[]',
      description: 'Array of data to display in the table',
      required: true,
    },
    {
      name: 'enableSorting',
      type: 'boolean',
      description: 'Enable sorting functionality',
      required: false,
      defaultValue: 'true',
    },
    {
      name: 'enablePagination',
      type: 'boolean',
      description: 'Enable pagination controls',
      required: false,
      defaultValue: 'true',
    },
    {
      name: 'enableRowSelection',
      type: 'boolean',
      description: 'Enable row selection with checkboxes',
      required: false,
      defaultValue: 'false',
    },
    {
      name: 'enableColumnVisibility',
      type: 'boolean',
      description: 'Enable column visibility toggle',
      required: false,
      defaultValue: 'false',
    },
    {
      name: 'pageSize',
      type: 'number',
      description: 'Number of rows per page',
      required: false,
      defaultValue: '10',
    },
    {
      name: 'onRowClick',
      type: '(row: TData) => void',
      description: 'Callback when a row is clicked',
      required: false,
    },
    {
      name: 'emptyState',
      type: 'React.ReactNode',
      description: 'Custom empty state component',
      required: false,
    },
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS classes',
      required: false,
    },
  ],
  dependencies: ['@tanstack/react-table'],
  examples: [
    {
      title: 'Payments Table',
      description: 'Sortable payments table with status badges and formatted currency',
      code: `import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { ArrowUpDown } from 'lucide-react';

type Payment = {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  email: string;
  date: string;
};

const paymentsData: Payment[] = [
  { id: '1', amount: 125.5, status: 'success', email: 'alice@example.com', date: '2024-01-15' },
  { id: '2', amount: 89.99, status: 'processing', email: 'bob@example.com', date: '2024-01-14' },
  { id: '3', amount: 250.0, status: 'failed', email: 'charlie@example.com', date: '2024-01-13' },
  { id: '4', amount: 45.75, status: 'pending', email: 'diana@example.com', date: '2024-01-12' },
  { id: '5', amount: 310.25, status: 'success', email: 'edward@example.com', date: '2024-01-11' },
];

const paymentsColumns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const variant = status === 'success' ? 'default'
        : status === 'processing' ? 'secondary'
        : status === 'failed' ? 'destructive'
        : 'outline';
      return <Badge variant={variant as any}>{status}</Badge>;
    },
  },
  {
    accessorKey: 'date',
    header: 'Date',
  },
];

export function PaymentsTable() {
  return (
    <DataTable
      columns={paymentsColumns}
      data={paymentsData}
      enableSorting={true}
      enablePagination={true}
      pageSize={10}
    />
  );
}`,
      preview: (
        <DataTable
          columns={paymentsColumns}
          data={paymentsData}
          enableSorting={true}
          enablePagination={true}
          pageSize={10}
        />
      ),
    },
    {
      title: 'User Management',
      description: 'User table with row selection, role badges, and action menu',
      code: `import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Checkbox } from '@/components/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  status: 'active' | 'inactive';
};

const usersData: User[] = [
  { id: '1', name: 'Alice Smith', email: 'alice@example.com', role: 'admin', status: 'active' },
  { id: '2', name: 'Bob Johnson', email: 'bob@example.com', role: 'user', status: 'active' },
  { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'user', status: 'inactive' },
  { id: '4', name: 'Diana Prince', email: 'diana@example.com', role: 'guest', status: 'active' },
];

const usersColumns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      return <Badge variant="secondary">{role}</Badge>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge variant={status === 'active' ? 'default' : 'outline'}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>Edit user</DropdownMenuItem>
          <DropdownMenuItem>View details</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Delete user</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export function UserManagementTable() {
  return (
    <DataTable
      columns={usersColumns}
      data={usersData}
      enableRowSelection={true}
      enablePagination={false}
    />
  );
}`,
      preview: (
        <DataTable
          columns={usersColumns}
          data={usersData}
          enableRowSelection={true}
          enablePagination={false}
        />
      ),
    },
    {
      title: 'Transaction History',
      description: 'Blockchain transaction table with type badges and formatted amounts',
      code: `import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/badge';

type Transaction = {
  id: string;
  txid: string;
  amount: number;
  type: 'send' | 'receive';
  timestamp: number;
  confirmations: number;
};

const transactionsData: Transaction[] = [
  { id: '1', txid: 'a1b2c3d4e5f6', amount: 0.05, type: 'receive', timestamp: 1704067200000, confirmations: 12 },
  { id: '2', txid: 'f6e5d4c3b2a1', amount: 0.02, type: 'send', timestamp: 1704066000000, confirmations: 8 },
  { id: '3', txid: 'g7h8i9j0k1l2', amount: 0.1, type: 'receive', timestamp: 1704064800000, confirmations: 25 },
];

const transactionsColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'txid',
    header: 'Transaction ID',
    cell: ({ row }) => {
      const txid = row.getValue('txid') as string;
      return <code className="text-xs">{txid.substring(0, 12)}...</code>;
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      return (
        <Badge variant={type === 'receive' ? 'default' : 'secondary'}>
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">Amount (BSV)</div>,
    cell: ({ row }) => {
      const amount = row.getValue('amount') as number;
      return <div className="text-right font-mono">{amount.toFixed(8)}</div>;
    },
  },
  {
    accessorKey: 'confirmations',
    header: 'Confirmations',
  },
  {
    accessorKey: 'timestamp',
    header: 'Date',
    cell: ({ row }) => {
      const timestamp = row.getValue('timestamp') as number;
      return new Date(timestamp).toLocaleDateString();
    },
  },
];

export function TransactionHistoryTable() {
  return (
    <DataTable
      columns={transactionsColumns}
      data={transactionsData}
      enablePagination={false}
    />
  );
}`,
      preview: (
        <DataTable
          columns={transactionsColumns}
          data={transactionsData}
          enablePagination={false}
        />
      ),
    },
    {
      title: 'Inventory Management',
      description: 'Inventory table with low stock highlighting and price formatting',
      code: `import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';

type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  stock: number;
  reorderPoint: number;
  price: number;
};

const inventoryData: InventoryItem[] = [
  { id: '1', sku: 'WID-001', name: 'Widget A', stock: 150, reorderPoint: 50, price: 29.99 },
  { id: '2', sku: 'WID-002', name: 'Widget B', stock: 25, reorderPoint: 50, price: 39.99 },
  { id: '3', sku: 'GAD-001', name: 'Gadget X', stock: 5, reorderPoint: 20, price: 99.99 },
  { id: '4', sku: 'GAD-002', name: 'Gadget Y', stock: 200, reorderPoint: 75, price: 149.99 },
];

const inventoryColumns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: 'sku',
    header: 'SKU',
  },
  {
    accessorKey: 'name',
    header: 'Product Name',
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
    cell: ({ row }) => {
      const stock = row.getValue('stock') as number;
      const reorderPoint = row.original.reorderPoint;
      const isLow = stock < reorderPoint;
      return (
        <div className={isLow ? 'text-destructive font-semibold' : ''}>
          {stock} {isLow && '⚠️'}
        </div>
      );
    },
  },
  {
    accessorKey: 'reorderPoint',
    header: 'Reorder Point',
  },
  {
    accessorKey: 'price',
    header: () => <div className="text-right">Price</div>,
    cell: ({ row }) => {
      const price = row.getValue('price') as number;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(price);
      return <div className="text-right">{formatted}</div>;
    },
  },
];

export function InventoryTable() {
  return (
    <DataTable
      columns={inventoryColumns}
      data={inventoryData}
      enableSorting={true}
      enablePagination={false}
    />
  );
}`,
      preview: (
        <DataTable
          columns={inventoryColumns}
          data={inventoryData}
          enableSorting={true}
          enablePagination={false}
        />
      ),
    },
    {
      title: 'Analytics Dashboard',
      description: 'Analytics table with metrics, percentage changes, and sparkline trends',
      code: `import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';

type AnalyticsData = {
  id: string;
  metric: string;
  value: number;
  change: number;
  trend: number[];
};

const analyticsData: AnalyticsData[] = [
  { id: '1', metric: 'Total Users', value: 12450, change: 12.5, trend: [100, 110, 105, 120, 115, 125] },
  { id: '2', metric: 'Revenue', value: 45800, change: 8.3, trend: [400, 420, 410, 445, 430, 458] },
  { id: '3', metric: 'Conversions', value: 892, change: -2.4, trend: [90, 88, 92, 89, 87, 89] },
  { id: '4', metric: 'Page Views', value: 98765, change: 15.7, trend: [800, 850, 900, 920, 950, 988] },
];

const analyticsColumns: ColumnDef<AnalyticsData>[] = [
  {
    accessorKey: 'metric',
    header: 'Metric',
  },
  {
    accessorKey: 'value',
    header: () => <div className="text-right">Value</div>,
    cell: ({ row }) => {
      const value = row.getValue('value') as number;
      const formatted = new Intl.NumberFormat('en-US').format(value);
      return <div className="text-right font-mono">{formatted}</div>;
    },
  },
  {
    accessorKey: 'change',
    header: () => <div className="text-right">Change (%)</div>,
    cell: ({ row }) => {
      const change = row.getValue('change') as number;
      const isPositive = change > 0;
      return (
        <div className={\`text-right font-semibold \${isPositive ? 'text-green-600' : 'text-destructive'}\`}>
          {isPositive ? '+' : ''}{change.toFixed(1)}%
        </div>
      );
    },
  },
  {
    accessorKey: 'trend',
    header: 'Trend',
    cell: ({ row }) => {
      const trend = row.getValue('trend') as number[];
      const max = Math.max(...trend);
      const min = Math.min(...trend);
      return (
        <div className="flex items-end space-x-1 h-8">
          {trend.map((value, i) => {
            const height = ((value - min) / (max - min)) * 100;
            return (
              <div
                key={i}
                className="w-2 bg-primary rounded-t"
                style={{ height: \`\${height}%\` }}
              />
            );
          })}
        </div>
      );
    },
  },
];

export function AnalyticsDashboardTable() {
  return (
    <DataTable
      columns={analyticsColumns}
      data={analyticsData}
      enablePagination={false}
    />
  );
}`,
      preview: (
        <DataTable
          columns={analyticsColumns}
          data={analyticsData}
          enablePagination={false}
        />
      ),
    },
    {
      title: 'Order Management',
      description: 'Orders table with status badges, formatted totals, and action dropdown',
      code: `import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

type Order = {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
};

const ordersData: Order[] = [
  { id: '1', orderNumber: 'ORD-2024-001', customer: 'Alice Smith', total: 289.99, status: 'delivered', date: '2024-01-10' },
  { id: '2', orderNumber: 'ORD-2024-002', customer: 'Bob Johnson', total: 149.50, status: 'shipped', date: '2024-01-12' },
  { id: '3', orderNumber: 'ORD-2024-003', customer: 'Charlie Brown', total: 499.99, status: 'processing', date: '2024-01-14' },
  { id: '4', orderNumber: 'ORD-2024-004', customer: 'Diana Prince', total: 89.95, status: 'pending', date: '2024-01-15' },
];

const ordersColumns: ColumnDef<Order>[] = [
  {
    accessorKey: 'orderNumber',
    header: 'Order #',
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
  },
  {
    accessorKey: 'total',
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => {
      const total = row.getValue('total') as number;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(total);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const variant = status === 'delivered' ? 'default'
        : status === 'shipped' ? 'secondary'
        : status === 'processing' ? 'outline'
        : status === 'pending' ? 'secondary'
        : 'destructive';
      return <Badge variant={variant as any}>{status}</Badge>;
    },
  },
  {
    accessorKey: 'date',
    header: 'Date',
  },
  {
    id: 'actions',
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>View order</DropdownMenuItem>
          <DropdownMenuItem>Edit order</DropdownMenuItem>
          <DropdownMenuItem>Track shipment</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Cancel order</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export function OrderManagementTable() {
  return (
    <DataTable
      columns={ordersColumns}
      data={ordersData}
      enableSorting={true}
      enablePagination={true}
      pageSize={5}
      onRowClick={(row) => console.log('Order clicked:', row)}
    />
  );
}`,
      preview: (
        <DataTable
          columns={ordersColumns}
          data={ordersData}
          enableSorting={true}
          enablePagination={true}
          pageSize={5}
          onRowClick={(row) => console.log('Order clicked:', row)}
        />
      ),
    },
  ],
};
