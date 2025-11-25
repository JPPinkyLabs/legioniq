import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button, buttonVariants } from "@/components/ui/button"

const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("group relative flex min-w-0 flex-col", className)}
      {...props}
    />
  )
})
InputGroup.displayName = "InputGroup"

const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      data-slot="input-group-control"
      className={cn(
        "peer rounded-md border-input bg-background pr-3 pl-3",
        className
      )}
      {...props}
    />
  )
})
InputGroupInput.displayName = "InputGroupInput"

const InputGroupTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<typeof Textarea>
>(({ className, ...props }, ref) => {
  return (
    <Textarea
      ref={ref}
      data-slot="input-group-control"
      className={cn(
        "peer resize-none rounded-md border-input bg-background pr-3 pl-3",
        className
      )}
      {...props}
    />
  )
})
InputGroupTextarea.displayName = "InputGroupTextarea"

type InputGroupAddonProps = React.HTMLAttributes<HTMLDivElement> & {
  align?: "inline-start" | "inline-end" | "block-start" | "block-end"
}

const InputGroupAddon = React.forwardRef<HTMLDivElement, InputGroupAddonProps>(
  ({ className, align = "inline-start", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "pointer-events-none absolute z-10 flex items-center gap-1 text-muted-foreground transition-colors peer-focus-within:text-foreground",
          align === "inline-start" && "left-3 top-1/2 -translate-y-1/2",
          align === "inline-end" && "right-3 top-1/2 -translate-y-1/2",
          align === "block-start" && "left-3 top-3",
          align === "block-end" &&
            "bottom-3 left-3 right-3 pointer-events-auto",
          className
        )}
        {...props}
      />
    )
  }
)
InputGroupAddon.displayName = "InputGroupAddon"

const InputGroupText = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
})
InputGroupText.displayName = "InputGroupText"

const inputGroupButtonVariants = cva(
  "pointer-events-auto shrink-0",
  {
    variants: {
      size: {
        xs: "h-5 px-1.5 text-xs",
        "icon-xs": "h-5 w-5",
        sm: "h-6 px-2 text-xs",
        "icon-sm": "h-6 w-6",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  }
)

export interface InputGroupButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof inputGroupButtonVariants> {
  asChild?: boolean
  variant?: VariantProps<typeof buttonVariants>["variant"]
}

const InputGroupButton = React.forwardRef<
  HTMLButtonElement,
  InputGroupButtonProps
>(({ className, size, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(
        buttonVariants({ variant, className }),
        inputGroupButtonVariants({ size }),
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
InputGroupButton.displayName = "InputGroupButton"

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
}

