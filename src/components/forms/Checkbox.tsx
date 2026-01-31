import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cn } from "@/lib/utils";
import { Check as CheckIcon } from "lucide-react";

type CheckboxProps = React.ComponentPropsWithRef<typeof CheckboxPrimitive.Root>;

export default function Checkbox({
  className,
  ...rest
}: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "flex appearance-none items-center justify-center size-5 border border-base-400 focus:ring-2 ring-base-500 outline-none rounded-[4px] shadow-xs cursor-pointer",
        className
      )}
      data-role="checkbox-root"
      {...rest}
    >
      <CheckboxPrimitive.Indicator
        className="data-[state=indeterminate]:opacity-25"
        data-role="checkbox-indicator"
      >
        <CheckIcon
          className="size-4 text-base-500"
          data-role="checkbox-icon"
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
