"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Table Component with Accessibility Support
 * 
 * This component provides accessible table elements following WCAG guidelines.
 * 
 * Usage Guidelines:
 * - Always include a TableHeader with TableHead elements for column headers
 * - TableHead elements automatically include scope="col" for accessibility
 * - Use TableCaption to provide a summary or description of the table content
 * - For complex tables with row headers, manually add scope="row" to relevant TableCell elements
 * 
 * Example:
 * <Table>
 *   <TableCaption>Monthly sales summary</TableCaption>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>Month</TableHead>
 *       <TableHead>Sales</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>January</TableCell>
 *       <TableCell>$1,000</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 */

function Table({ className, children, ...props }: React.ComponentProps<"table">) {
  // Development warning for accessibility
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const tableElement = document.querySelector(`[data-slot="table"]`);
      if (tableElement) {
        const hasHeader = tableElement.querySelector('thead th[scope="col"]') || 
                         tableElement.querySelector('th[scope="col"]') ||
                         tableElement.querySelector('thead');
        if (!hasHeader) {
          console.warn(
            '⚠️ Table Accessibility Warning: Table should include a header with <th scope="col"> elements for better accessibility. ' +
            'Use TableHeader and TableHead components or ensure proper table structure.'
          );
        }
      }
    }
  }, [children]);

  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        role="table"
        {...props}
      >
        {children}
      </table>
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      scope="col"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
