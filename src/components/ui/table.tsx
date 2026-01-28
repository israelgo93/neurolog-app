"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// ================================================================
// TABLE ROOT COMPONENT
// ================================================================

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

// ================================================================
// TABLE HEADER COMPONENT
// ================================================================

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

// ================================================================
// TABLE BODY COMPONENT
// ================================================================

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

// ================================================================
// TABLE FOOTER COMPONENT
// ================================================================

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

// ================================================================
// TABLE ROW COMPONENT
// ================================================================

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

// ================================================================
// TABLE HEADER CELL COMPONENT
// ================================================================

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

// ================================================================
// TABLE CELL COMPONENT
// ================================================================

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

// ================================================================
// TABLE CAPTION COMPONENT
// ================================================================

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

// ================================================================
// LAYOUT TABLE COMPONENT (Para uso de layout - SonarQube Exception)
// ================================================================

const LayoutTable = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & {
    ariaHidden?: boolean
  }
>(({ className, ariaHidden = false, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      role="presentation"
      aria-hidden={ariaHidden}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
LayoutTable.displayName = "LayoutTable"

// ================================================================
// DATA TABLE COMPONENT (Para datos tabulares - Accesible)
// ================================================================

interface DataTableProps extends React.HTMLAttributes<HTMLTableElement> {
  caption?: string
  summary?: string
}

const DataTable = React.forwardRef<HTMLTableElement, DataTableProps>(
  ({ className, caption, summary, children, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm", className)}
        summary={summary}
        {...props}
      >
        {caption && <TableCaption>{caption}</TableCaption>}
        {children}
      </table>
    </div>
  )
)
DataTable.displayName = "DataTable"

// ================================================================
// RESPONSIVE TABLE WRAPPER
// ================================================================

interface ResponsiveTableProps {
  children: React.ReactNode
  className?: string
  breakpoint?: "sm" | "md" | "lg" | "xl"
}

const ResponsiveTable = ({
  children,
  className,
  breakpoint = "md",
}: ResponsiveTableProps) => {
  const breakpointClasses = {
    sm: "sm:block",
    md: "md:block",
    lg: "lg:block",
    xl: "xl:block",
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Mobile view */}
      <div className={cn("block", breakpointClasses[breakpoint], "hidden")}>
        {children}
      </div>

      {/* Mobile fallback */}
      <div className={cn("block", breakpointClasses[breakpoint], "sm:hidden")}>
        <div className="space-y-3">
          {/* Mobile table representation would go here */}
          <div className="text-sm text-muted-foreground">
            Vista móvil: Usa una pantalla más grande para ver la tabla completa
          </div>
        </div>
      </div>
    </div>
  )
}

// ================================================================
// EXPORTS
// ================================================================

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  LayoutTable,
  DataTable,
  ResponsiveTable,
}

// ================================================================
// TIPOS PARA TYPESCRIPT
// ================================================================

export type TableProps = React.HTMLAttributes<HTMLTableElement>
export type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement>
export type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>
export type TableFooterProps = React.HTMLAttributes<HTMLTableSectionElement>
export type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>
export type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement>
export type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>
export type TableCaptionProps = React.HTMLAttributes<HTMLTableCaptionElement>

// ================================================================
// UTILIDADES PARA TABLAS ACCESIBLES
// ================================================================

export const tableUtils = {
  // Generar IDs únicos para headers
  generateHeaderId: (prefix: string, index: number) => `${prefix}-header-${index}`,

  // Generar IDs únicos para celdas
  generateCellId: (prefix: string, row: number, col: number) => `${prefix}-cell-${row}-${col}`,

  // Validar que una tabla tenga headers apropiados
  validateTableStructure: (tableElement: HTMLTableElement) => {
    const headers = tableElement.querySelectorAll("th")
    const rows = tableElement.querySelectorAll("tr")

    return {
      hasHeaders: headers.length > 0,
      headerCount: headers.length,
      rowCount: rows.length,
      isValid: headers.length > 0 && rows.length > 0,
    }
  },
}
