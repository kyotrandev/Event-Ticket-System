import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-none border-2 border-transparent bg-clip-padding text-sm font-bold font-mono uppercase tracking-wide whitespace-nowrap transition-all outline-none select-none focus-visible:translate-y-[2px] focus-visible:translate-x-[2px] focus-visible:shadow-none disabled:pointer-events-none disabled:opacity-50 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-white shadow-[4px_4px_0px_rgba(17,24,39,1)] hover:shadow-[2px_2px_0px_rgba(17,24,39,1)] hover:translate-y-[2px] hover:translate-x-[2px]",
        outline:
          "border-gray-900 bg-white text-gray-900 shadow-[4px_4px_0px_rgba(17,24,39,0.1)] hover:shadow-[2px_2px_0px_rgba(17,24,39,0.1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:bg-gray-50",
        secondary:
          "border-gray-900 bg-secondary text-white shadow-[4px_4px_0px_rgba(17,24,39,1)] hover:shadow-[2px_2px_0px_rgba(17,24,39,1)] hover:translate-y-[2px] hover:translate-x-[2px]",
        ghost:
          "border-transparent hover:bg-gray-100 hover:text-gray-900 !shadow-none active:!translate-y-[1px] active:!translate-x-[1px]",
        destructive:
          "border-gray-900 bg-danger text-white shadow-[4px_4px_0px_rgba(17,24,39,1)] hover:shadow-[2px_2px_0px_rgba(17,24,39,1)] hover:translate-y-[2px] hover:translate-x-[2px]",
        link: "text-primary underline-offset-4 hover:underline !shadow-none",
      },
      size: {
        default:
          "h-10 gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 px-2 text-xs",
        sm: "h-8 gap-1.5 px-3 text-xs",
        lg: "h-12 gap-2 px-6",
        icon: "size-10",
        "icon-xs": "size-7",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      type={type}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
