import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm shadow-elevation-xs transition-all duration-150 placeholder:text-muted-foreground/70 hover:border-jic-forest/35 focus-visible:border-jic-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jic-forest/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
