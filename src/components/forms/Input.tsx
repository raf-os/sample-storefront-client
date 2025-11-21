import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

export type InputProps = React.ComponentPropsWithRef<'input'> & {
    onValueChange?: (newValue: React.ComponentPropsWithRef<'input'>['value']) => void,
};

export default function Input({
    className,
    value,
    name,
    defaultValue,
    onValueChange,
    onChange,
    ...rest
}: InputProps) {
    const isControlled = value !== undefined;

    const { setValue } = useFormContext();

    const [ inputValue, setInputValue ] = useState<typeof value>(defaultValue ?? "");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        
        if (!isControlled) {
            setInputValue(newVal);
        }

        onValueChange?.(newVal);
        onChange?.(e);
    }

    useEffect(() => {
        if (isControlled) return;
        if (defaultValue !== undefined && defaultValue !== null) {
            setInputValue(defaultValue);
            if (setValue && name) {
                setValue(name, defaultValue);
            }
        }
    }, [ defaultValue, isControlled, name, setValue ]);

    return (
        <input
            data-role="input-field"
            className={cn(
                "bg-base-200 text-base-500 rounded-field px-3 py-1 border border-base-300 outline-none",
                "focus:ring-2 focus:ring-base-500 aria-invalid:ring-2 aria-invalid:ring-destructive-content",
                "disabled:bg-base-300",
                className
            )}
            name={name}
            value={value ?? inputValue}
            onChange={handleChange}
            { ...rest }
        />
    )
}