import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";

export type FieldSetProps<T extends React.ElementType = "input"> = Omit<React.ComponentPropsWithRef<T>, "name"> & {
    name: string,
    label?: string,
    errorAlignment?: "horizontal" | "vertical",
    as?: T
}

export default function FieldSet<T extends React.ElementType = "input">({
    children,
    name,
    as,
    label,
    type,
    errorAlignment = "vertical",
    ...rest
}: FieldSetProps<T>) {
    const { register, formState: { errors } } = useFormContext();
    const Component = as || "input";

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
                        <label className="font-bold text-sm grow-0 shrink-0">
                            { label }
                        </label>

                    { errors[name] && (
                        <p className="text-red-500 text-sm">
                            { String(errors[name].message) }
                        </p>
                    ) }
                </div>
            )}

            <Component
                {...register(name, { valueAsNumber: type==="number" })}
                aria-invalid={!!errors[name]}
                type={type}
                {...rest}
            />
            { children }
        </fieldset>
    )
}