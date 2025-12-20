/* eslint-disable @typescript-eslint/no-unused-vars */
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import {
    Minus as MinusIcon,
    Plus as PlusIcon
} from "lucide-react";

type TNumberButtonInputProps = Omit<React.ComponentPropsWithRef<'input'>, "value" | "defaultValue"> & {
	value?: number,
	defaultValue?: number,
	onValueChange?: (newVal: number) => void,
	/** Maximum value this component can reach. Defaults to 99. */
	maxValue?: number,
}

export default function NumberButtonInput({
	type: _,
	inputMode: __,
	pattern,
	className,
	defaultValue,
	value,
	onValueChange,
	maxValue = 99,
    "aria-invalid": ariaInvalid,
	...rest
}: TNumberButtonInputProps) {
	const isControlled = value !== undefined && onValueChange !== undefined;

	useEffect(() => {
		if (isControlled && (value === undefined || onValueChange === undefined)) {
			console.error("NumberButtonInput instance is only partially controlled, assign both 'value' and 'onValueChange' props.");
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isControlled]);

	const [ val, setVal ] = useState<number>(defaultValue ?? value ?? 1);

	const handleValueChange = (newValue: string | number | ((oldVal: number) => number)) => {
		let parsedValue = newValue;

        if (typeof parsedValue === "function") {
            parsedValue = parsedValue(isControlled ? value : val);
        }

		if (typeof parsedValue === "string") {
            parsedValue = parsedValue.replace(/[^0-9]/g, "");
            parsedValue = Number(parsedValue);
        }

		parsedValue = Math.min(maxValue, Math.max(1, parsedValue));

		if (isControlled) {
			onValueChange(parsedValue);
		} else {
			setVal(parsedValue);
		}
	}

    const CustomButton = useCallback(({ className, children, ...rest }: React.ComponentPropsWithRef<'button'>) => {
        return (
            <button
                className={cn(
                    "flex items-center justify-center p-[2px] grow-0 shrink-0 w-10 bg-base-300 text-base-500 transition-colors duration-100 [&>svg]:size-5 cursor-pointer",
                    "border-base-300 hover:bg-base-400",
                    className
                )}
                {...rest}
            >
                {children}
            </button>
        )
    }, []);

	return (
		<div
            aria-invalid={ariaInvalid}
			className={cn(
				"flex w-30 h-9 rounded-field ring-base-500 aria-[invalid]:ring-error-content aria-[invalid]:ring-4 focus-within:ring-4 shadow-xs transition-shadow",
				className
			)}
			data-slot="wrapper"
		>
			<CustomButton
                className="rounded-l-field border-r-2"
                data-slot="button-minus"
                onClick={() => handleValueChange(val => val - 1)}
                tabIndex={-1}
            >
				<MinusIcon />
			</CustomButton>
			
            <input
                type="text"
                inputMode="numeric"
                pattern={pattern ?? "[0-9]*"}
                value={isControlled ? value : val}
                onChange={e => handleValueChange(e.target.value)}
                data-slot="input"
                className="outline-none grow-1 shrink-1 w-full text-center border-base-300 border-t-2 border-b-2 bg-base-200 px-[4px] py-[2px] leading-none"
                { ...rest }
            />

            <CustomButton
                className="rounded-r-field border-l-2"
                data-slot="button-plus"
                onClick={() => handleValueChange(val => val + 1)}
                tabIndex={-1}
            >
                <PlusIcon />
            </CustomButton>
		</div>
	)
}