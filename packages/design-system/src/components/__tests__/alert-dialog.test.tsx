import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '../alert-dialog';
import { Button } from '../button';

describe('AlertDialog', () => {
  it('should render trigger button', () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Open Alert</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    expect(screen.getByText('Open Alert')).toBeInTheDocument();
  });

  it('should render with custom className on trigger', () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button className="custom-class">Open</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Title</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>
    );

    const button = screen.getByText('Open');
    expect(button).toHaveClass('custom-class');
  });
});
