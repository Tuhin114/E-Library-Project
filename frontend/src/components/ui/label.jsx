import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Label = forwardRef(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn('text-sm font-semibold leading-none text-foreground', className)}
      {...props}
    />
  );
});
Label.displayName = 'Label';

export { Label };
