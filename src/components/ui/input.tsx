import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg bg-[#f9f9f9] px-3 py-2.5 text-sm shadow-[0px_2px_6px_-2px_rgba(0,0,0,0.2),0px_0px_0px_1px_rgba(0,0,0,0.05),inset_0px_1px_2px_0px_#ffffff] placeholder:text-black placeholder:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 border-0",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
