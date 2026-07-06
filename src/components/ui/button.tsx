import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { Pressable } from "react-native";

export const buttonStyles = cva(
  "transform rounded-lg p-4 active:translate-y-0.75",
  {
    variants: {
      variant: {
        standard: "bg-gray-400 dark:bg-gray-700",
        primary: "bg-blue-400 dark:bg-blue-700",
        warning: "bg-yellow-400 dark:bg-yellow-700",
        destructive: "bg-red-400 dark:bg-red-700",
      },
    },
    defaultVariants: {
      variant: "standard",
    },
  },
);

export function Button({
  className,
  variant,
  ...rest
}: React.ComponentProps<typeof Pressable> & VariantProps<typeof buttonStyles>) {
  return (
    <Pressable className={cn(buttonStyles({ variant }), className)} {...rest} />
  );
}
