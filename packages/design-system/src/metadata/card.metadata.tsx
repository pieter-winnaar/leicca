
import type { ComponentMetadata } from '../types/component.types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/card';
import { Button } from '../components/button';

export const cardMetadata: ComponentMetadata = {
  id: 'card',
  name: 'Card',
  description: 'Container component with header, content, and footer for grouping related information',
  category: 'layout',
  variants: [],
  preview: (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3 text-foreground">Basic Card</h3>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description goes here</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Card content goes here. This is a sample card component.
            </p>
          </CardContent>
          <CardFooter>
            <Button size="sm">Action</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  ),
  props: [
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS classes',
      required: false,
    },
    {
      name: 'children',
      type: 'React.ReactNode',
      description: 'Card content',
      required: true,
    }
  ],
  examples: [
    {
      title: 'Basic Card',
      description: 'Simple card with header, content, and footer',
      code: `<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here.</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>`,
      language: 'tsx',
      preview: (
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description goes here</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-card-foreground">Card content goes here.</p>
          </CardContent>
          <CardFooter>
            <Button>Action</Button>
          </CardFooter>
        </Card>
      )
    },
    {
      title: 'Card with Header Only',
      description: 'Card with just header and content',
      code: `<Card>
  <CardHeader>
    <CardTitle>Simple Card</CardTitle>
  </CardHeader>
  <CardContent>
    <p>This card has no footer.</p>
  </CardContent>
</Card>`,
      language: 'tsx',
      preview: (
        <Card>
          <CardHeader>
            <CardTitle>Simple Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-card-foreground">This card has no footer.</p>
          </CardContent>
        </Card>
      )
    },
    {
      title: 'Card with Multiple Actions',
      description: 'Card with multiple actions in footer',
      code: `<Card>
  <CardHeader>
    <CardTitle>Confirm Action</CardTitle>
    <CardDescription>Are you sure you want to proceed?</CardDescription>
  </CardHeader>
  <CardContent>
    <p>This action cannot be undone.</p>
  </CardContent>
  <CardFooter className="flex gap-2">
    <Button variant="outline">Cancel</Button>
    <Button variant="destructive">Delete</Button>
  </CardFooter>
</Card>`,
      language: 'tsx',
      preview: (
        <Card>
          <CardHeader>
            <CardTitle>Confirm Action</CardTitle>
            <CardDescription>Are you sure you want to proceed?</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-card-foreground">This action cannot be undone.</p>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline">Cancel</Button>
            <Button variant="destructive">Delete</Button>
          </CardFooter>
        </Card>
      )
    }
  ],
  dependencies: ['react'],
  tags: ['card', 'container', 'layout', 'panel', 'box']
};
