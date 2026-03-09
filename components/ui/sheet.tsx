"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

interface SheetTriggerProps {
  asChild?: boolean
  children: React.ReactElement
}

interface SheetContentProps {
  side?: "left" | "right" | "top" | "bottom"
  className?: string
  children: React.ReactNode
}

const SheetContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>({
  open: false,
  onOpenChange: () => {},
})

function Sheet({ open = false, onOpenChange, children }: SheetProps) {
  return (
    <SheetContext.Provider value={{ open, onOpenChange: onOpenChange || (() => {}) }}>
      {children}
    </SheetContext.Provider>
  )
}

function SheetTrigger({ asChild = false, children }: SheetTriggerProps) {
  const { onOpenChange } = React.useContext(SheetContext)

  if (asChild) {
    return React.cloneElement(children, {
      onClick: () => onOpenChange(true),
    } as any)
  }

  return <button onClick={() => onOpenChange(true)}>{children}</button>
}

function SheetContent({ side = "right", className, children }: SheetContentProps) {
  const { open, onOpenChange } = React.useContext(SheetContext)

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [onOpenChange])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/80"
        onClick={() => onOpenChange(false)}
      />
      {/* Sheet */}
      <div
        className={cn(
          "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out",
          side === "right" && "inset-y-0 left-0 sm:max-w-sm sm:border-l",
          side === "left" && "inset-y-0 right-0 sm:max-w-sm sm:border-r",
          side === "top" && "inset-x-0 bottom-0 sm:max-h-sm sm:border-b",
          side === "bottom" && "inset-x-0 top-0 sm:max-h-sm sm:border-t",
          className
        )}
      >
        {children}
      </div>
    </>
  )
}

export { Sheet, SheetContent, SheetTrigger }
