/* eslint-disable react-refresh/only-export-components */
import z from "zod";
import FieldSet from "./FieldSet";
import { useCallback } from "react";

import * as Tooltip from "@radix-ui/react-tooltip";
import {
    FilePen,
    TriangleAlert as AlertIcon
} from "lucide-react";
import { useFormContext, type Path } from "react-hook-form";

function FormChangeAlertButton({ children, tooltip }: { children: React.ReactNode, tooltip: React.ReactNode }) {
    return (
        <Tooltip.Root>
            <Tooltip.Trigger asChild>
                { children }
            </Tooltip.Trigger>
            <Tooltip.Portal>
                <Tooltip.Content
                    sideOffset={4}
                    className="bg-base-200 border border-base-300 px-3 py-2 rounded-box shadow-sm text-sm text-base-500/75 animate-slideUpAndFade"
                >
                    { tooltip }
                    <Tooltip.Arrow className="fill-base-400" />
                </Tooltip.Content>
            </Tooltip.Portal>
        </Tooltip.Root>
    )
}

export function createAwaitedFieldSet<T extends z.ZodObject>() {
    return function AwaitedFieldSet<K extends keyof z.input<T>>({
        disabled,
        name,
        label,
        value,
        showIsDirty,
        ...rest
    }: React.ComponentPropsWithRef<typeof FieldSet> & {
        value?: z.input<T>[K],
        name: Path<z.output<T>>,
        showIsDirty?: boolean
    }) {
        const { getFieldState, trigger } = useFormContext<z.infer<T>>();
        const { isDirty, error } = getFieldState(name);

        const myVal = value;

        const labelJsx = useCallback(() => (
            <>
                {label}
                <div className="flex gap-1 ml-2">
                { (isDirty && showIsDirty === true) && (
                    <FormChangeAlertButton tooltip="This field was changed.">
                        <FilePen className="inline-block stroke-primary-200" />
                    </FormChangeAlertButton>
                )}
                { error && (
                    <AlertIcon className="stroke-destructive-content" />
                )}
                </div>
            </>
        // eslint-disable-next-line react-hooks/exhaustive-deps
        ), [label, isDirty, error]);

        const handleOnBlur = () => {
            trigger(name);
        }

        return (
            <FieldSet
                {...rest}
                name={name}
                label={labelJsx()}
                defaultValue={myVal}
                disabled={ disabled }
                onBlur={ handleOnBlur }
            />
        );
    }
}