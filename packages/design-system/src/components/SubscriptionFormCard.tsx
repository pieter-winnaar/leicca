/**
 * SubscriptionFormCard Component
 *
 * Payment form card for subscription upgrade
 */

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { Checkbox } from './checkbox';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { cn } from '../lib/utils';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  description?: string;
}

export interface SubscriptionFormData {
  name: string;
  email: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  zip: string;
  plan: string;
  notes: string;
  termsAccepted: boolean;
  marketingAccepted: boolean;
}

export interface SubscriptionFormCardProps extends React.ComponentPropsWithoutRef<typeof Card> {
  title?: string;
  description?: string;
  plans?: SubscriptionPlan[];
  defaultPlan?: string;
  onSubscriptionSubmit?: (data: SubscriptionFormData) => void;
  submitLabel?: string;
}

/**
 * SubscriptionFormCard - Payment form for subscription upgrade
 *
 * @example
 * ```tsx
 * const plans = [
 *   { id: 'starter', name: 'Starter Plan', price: '$9/month' },
 *   { id: 'pro', name: 'Pro Plan', price: '$29/month' },
 * ];
 *
 * <SubscriptionFormCard
 *   title="Upgrade your subscription"
 *   description="Enter your payment details"
 *   plans={plans}
 *   defaultPlan="pro"
 *   onSubmit={(data) => console.log('Form submitted:', data)}
 * />
 * ```
 */
export const SubscriptionFormCard = React.forwardRef<HTMLDivElement, SubscriptionFormCardProps>(
  (
    {
      title = 'Upgrade your subscription',
      description = 'Enter your payment details to upgrade to a premium plan',
      plans = [
        { id: 'starter', name: 'Starter Plan', price: '$9/month' },
        { id: 'pro', name: 'Pro Plan', price: '$29/month' },
      ],
      defaultPlan = 'starter',
      onSubscriptionSubmit,
      submitLabel = 'Subscribe',
      className,
      ...props
    },
    ref
  ) => {
    const [formData, setFormData] = React.useState<SubscriptionFormData>({
      name: '',
      email: '',
      cardNumber: '',
      expiry: '',
      cvc: '',
      zip: '',
      plan: defaultPlan,
      notes: '',
      termsAccepted: false,
      marketingAccepted: false,
    });

    const handleInputChange = (field: keyof SubscriptionFormData, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
      onSubscriptionSubmit?.(formData);
    };

    return (
      <Card ref={ref} className={cn(className)} {...props}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="card">Card Number</Label>
            <Input
              id="card"
              placeholder="4242 4242 4242 4242"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={formData.expiry}
                onChange={(e) => handleInputChange('expiry', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                placeholder="123"
                value={formData.cvc}
                onChange={(e) => handleInputChange('cvc', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP</Label>
              <Input
                id="zip"
                placeholder="12345"
                value={formData.zip}
                onChange={(e) => handleInputChange('zip', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Select Plan</Label>
            <RadioGroup
              value={formData.plan}
              onValueChange={(value) => handleInputChange('plan', value)}
            >
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center space-x-2 rounded-md border p-3 hover:bg-accent"
                >
                  <RadioGroupItem value={plan.id} id={plan.id} />
                  <Label htmlFor={plan.id} className="flex-1 cursor-pointer">
                    <div className="font-medium">{plan.name}</div>
                    <div className="text-sm text-muted-foreground">{plan.price}</div>
                    {plan.description && (
                      <div className="text-xs text-muted-foreground mt-1">{plan.description}</div>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional information..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.termsAccepted}
                onCheckedChange={(checked) =>
                  handleInputChange('termsAccepted', checked as boolean)
                }
              />
              <Label htmlFor="terms" className="text-sm cursor-pointer">
                I agree to the terms and conditions
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="marketing"
                checked={formData.marketingAccepted}
                onCheckedChange={(checked) =>
                  handleInputChange('marketingAccepted', checked as boolean)
                }
              />
              <Label htmlFor="marketing" className="text-sm cursor-pointer">
                Allow us to send you marketing emails
              </Label>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSubmit}>
            {submitLabel}
          </Button>
        </CardFooter>
      </Card>
    );
  }
);

SubscriptionFormCard.displayName = 'SubscriptionFormCard';
