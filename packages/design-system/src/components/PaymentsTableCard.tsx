/**
 * PaymentsTableCard Component
 *
 * Dashboard card with payments data table
 */

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Badge } from './badge';
import { cn } from '../lib/utils';

export interface PaymentData {
  id: string;
  status: 'Success' | 'Processing' | 'Failed';
  email: string;
  amount: string;
}

export interface PaymentsTableCardProps extends React.ComponentPropsWithoutRef<typeof Card> {
  title?: string;
  description?: string;
  payments: PaymentData[];
  onRowClick?: (payment: PaymentData) => void;
}

/**
 * PaymentsTableCard - Payments table with status badges
 *
 * @example
 * ```tsx
 * const payments = [
 *   { id: '1', status: 'Success', email: 'user@example.com', amount: '$310.00' },
 *   { id: '2', status: 'Processing', email: 'user2@example.com', amount: '$242.00' },
 * ];
 *
 * <PaymentsTableCard
 *   title="Payments"
 *   description="Manage your payment history"
 *   payments={payments}
 *   onRowClick={(payment) => console.log('Clicked:', payment)}
 * />
 * ```
 */
export const PaymentsTableCard = React.forwardRef<HTMLDivElement, PaymentsTableCardProps>(
  (
    {
      title = 'Payments',
      description = 'Manage your payment history',
      payments,
      onRowClick,
      className,
      ...props
    },
    ref
  ) => {
    const getStatusVariant = (status: PaymentData['status']) => {
      switch (status) {
        case 'Success':
          return 'default';
        case 'Processing':
          return 'secondary';
        case 'Failed':
          return 'destructive';
        default:
          return 'default';
      }
    };

    const handleRowClick = (payment: PaymentData) => {
      onRowClick?.(payment);
    };

    return (
      <Card ref={ref} className={cn(className)} {...props}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow
                  key={payment.id}
                  onClick={() => handleRowClick(payment)}
                  className={cn(onRowClick && 'cursor-pointer')}
                >
                  <TableCell>
                    <Badge variant={getStatusVariant(payment.status)}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{payment.email}</TableCell>
                  <TableCell className="text-right font-medium">{payment.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }
);

PaymentsTableCard.displayName = 'PaymentsTableCard';
