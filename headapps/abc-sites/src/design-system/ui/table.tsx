import type { ComponentProps } from 'react';
import { cn } from '@/design-system/lib/cn';

function Table({ className, ...props }: ComponentProps<'table'>) {
  return <table className={cn('w-full caption-bottom', className)} {...props} />;
}

function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  return <thead className={cn('[&_tr]:border-b', className)} {...props} />;
}

function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

function TableFooter({ className, ...props }: ComponentProps<'tfoot'>) {
  return (
    <tfoot
      className={cn('border-t bg-(--abc-surface-default-secondary) font-medium', className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  return <tr className={cn('border-b transition-colors', className)} {...props} />;
}

function TableHead({ className, ...props }: ComponentProps<'th'>) {
  return (
    <th
      className={cn(
        'h-(--abc-components-table-header-height) px-(--abc-spacing-inset-lg) py-(--abc-spacing-inset-md) text-left align-middle font-medium',
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: ComponentProps<'td'>) {
  return (
    <td
      className={cn(
        'px-(--abc-spacing-inset-lg) py-(--abc-spacing-inset-md) align-middle',
        className
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: ComponentProps<'caption'>) {
  return (
    <caption
      className={cn(
        'mt-(--abc-spacing-gap-md) text-body-sm text-(--abc-text-default-secondary)',
        className
      )}
      {...props}
    />
  );
}

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };
