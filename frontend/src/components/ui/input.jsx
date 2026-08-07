import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Base text input. Error styling is applied via the `error` prop so
 * form components don't need to duplicate conditional border classes.
 */
const Input = forwardRef(({ className, type = 'text', error, ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-destructive focus-visible:ring-destructive',
        className
      )}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
