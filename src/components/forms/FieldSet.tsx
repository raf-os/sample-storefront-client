import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";

export type FieldSetProps<T extends React.ElementType = "input"> = Omit<React.ComponentPropsWithRef<T>, "name" | "onBlur"> & {
    name: string,
    label?: React.ReactNode,
    errorAlignment?: "horizontal" | "vertical",
    as?: T,
    onBlur?: (e: React.SyntheticEvent) => void,
}

export default function FieldSet<T extends React.ElementType = "input">({
    children,
    name,
    as,
    label,
    type,
    errorAlignment = "vertical",
    onBlur,
    ...rest
}: FieldSetProps<T>) {
    const { register, formState: { errors } } = useFormContext();
    const Component = as || "input";

    const getTopmostErrorMessage = (error: any) => {
        if (error?.message) {
            return error.message;
        }

        if (error && typeof error === "object") {
            for (const key in error) {
                if (key !== "message" && error[key].message) {
                    return error[key].message;
                }
            }
        }

        return undefined;
    }

    const error = getTopmostErrorMessage(errors[name]);

    return (
        <fieldset
            className="flex flex-col gap-2"
        >
            { label && (
                <div
                    className={cn(
                        "flex",
                        errorAlignment === "vertical" && "flex-col",
                        errorAlignment === "horizontal" && "justify-between"
                    )}
                >
                        <label className="flex items-center font-bold text-sm grow-0 shrink-0 [&_svg]:size-4">
                            { label }
                        </label>

                    { errors[name] && (
                        <div className="text-red-500 text-sm">
                            { error }
                        </div>
                    ) }
                </div>
            )}

            <Component
                {...register(name, { onBlur: (e) => onBlur?.(e) })}
                aria-invalid={!!errors[name]}
                type={type}
                {...rest}
            />
            { children }
        </fieldset>
    )
}