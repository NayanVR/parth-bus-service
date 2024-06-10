import * as React from "react";

import { cn } from "@/lib/utils";
import { TriangleAlertIcon } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <HoverCard openDelay={100} closeDelay={100}>
            <HoverCardTrigger className="absolute right-3 top-3 text-destructive">
              <TriangleAlertIcon size={16} />
            </HoverCardTrigger>
            <HoverCardContent
              className="z-[10000] text-sm text-destructive"
              side="left"
              align="center"
            >
              {error && <p>{error}</p>}
            </HoverCardContent>
          </HoverCard>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
