import { useFormContext } from "react-hook-form";

export type FieldSetProps<T extends React.ElementType = "input"> = Omit<React.ComponentPropsWithRef<T>, "name"> & {
    name: string,
    label: string,
    as?: T
}

export default function FieldSet<T extends React.ElementType = "input">({
    children,
    name,
    as,
    label,
    ...rest
}: FieldSetProps<T>) {
    const { register, formState: { errors } } = useFormContext();
    const Component = as || "input";

    return (
        <fieldset
            className="flex flex-col gap-2"
        >
            <label className="font-bold text-sm">
                { label }
            </label>
            { errors[name] && (
                <p className="text-red-500 text-sm">
                    { String(errors[name].message) }
                </p>
            ) }
            <Component
                {...register(name)}
                {...rest}
            />
            { children }
        </fieldset>
    )
}