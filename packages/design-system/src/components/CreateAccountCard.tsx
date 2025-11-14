/**
 * CreateAccountCard Component
 *
 * Account creation form card with social login options
 */

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Separator } from './separator';
import { Avatar, AvatarFallback } from './avatar';
import { Github, Chrome } from 'lucide-react';
import { cn } from '../lib/utils';

export interface CreateAccountFormData {
  email: string;
  password: string;
}

export interface CreateAccountCardProps extends React.ComponentPropsWithoutRef<typeof Card> {
  title?: string;
  description?: string;
  onAccountSubmit?: (data: CreateAccountFormData) => void;
  onSocialLogin?: (provider: 'github' | 'google') => void;
  submitLabel?: string;
  showAvatar?: boolean;
  avatarName?: string;
  avatarEmail?: string;
  avatarInitials?: string;
  avatarMessage?: string;
}

/**
 * CreateAccountCard - Account creation form with social login
 *
 * @example
 * ```tsx
 * <CreateAccountCard
 *   title="Create an account"
 *   description="Enter your details to get started"
 *   showAvatar={true}
 *   onSubmit={(data) => console.log('Account created:', data)}
 *   onSocialLogin={(provider) => console.log('Social login:', provider)}
 * />
 * ```
 */
export const CreateAccountCard = React.forwardRef<HTMLDivElement, CreateAccountCardProps>(
  (
    {
      title = 'Create an account',
      description = 'Enter your details to get started',
      onAccountSubmit,
      onSocialLogin,
      submitLabel = 'Create account',
      showAvatar = true,
      avatarName = 'Sofia Davis',
      avatarEmail = 'sofia@example.com',
      avatarInitials = 'SD',
      avatarMessage = 'Hi, how can I help you today?',
      className,
      ...props
    },
    ref
  ) => {
    const [formData, setFormData] = React.useState<CreateAccountFormData>({
      email: '',
      password: '',
    });

    const handleInputChange = (field: keyof CreateAccountFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
      onAccountSubmit?.(formData);
    };

    const handleSocialLogin = (provider: 'github' | 'google') => {
      onSocialLogin?.(provider);
    };

    return (
      <Card ref={ref} className={cn(className)} {...props}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="m@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
            />
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => handleSocialLogin('github')}
              type="button"
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialLogin('google')}
              type="button"
            >
              <Chrome className="mr-2 h-4 w-4" />
              Google
            </Button>
          </div>
          {showAvatar && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>{avatarInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">{avatarName}</div>
                    <div className="text-xs text-muted-foreground">{avatarEmail}</div>
                  </div>
                </div>
                <div className="rounded-lg border p-3 text-sm">{avatarMessage}</div>
              </div>
            </>
          )}
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

CreateAccountCard.displayName = 'CreateAccountCard';
