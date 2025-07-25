import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300",
        secondary:
          "border-transparent bg-secondary-100 text-secondary-900 hover:bg-secondary-100/80",
        destructive:
          "border-transparent bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
        outline: "text-foreground",
        success:
          "border-transparent bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
        warning:
          "border-transparent bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
        info:
          "border-transparent bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
        gray:
          "border-transparent bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
