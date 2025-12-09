import z from "zod";

import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from "react";
import { useAuth, useServerAction } from "@/hooks";
import { GetUserPrivateData } from "@/lib/actions/userAction";
import type { paths } from "@/api/schema";
import { cn } from "@/lib/utils";

import { UserAccountForm } from "@/models/schemas";
import { createAwaitedFieldSet } from "@/components/forms/AwaitedFieldSet";
import { FieldSet, Input } from "@/components/forms";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/button";

export const Route = createFileRoute('/app/user/')({
    component: RouteComponent,
})

type TPrivateUserAlias = paths['/User/my-data']['get']['responses']['200']['content']['application/json'];

const AwaitedFieldSet = createAwaitedFieldSet<typeof UserAccountForm>();

function RouteComponent() {
    const { authData } = useAuth();
    const [ isPending, startTransition, errorMessage ] = useServerAction();
    const [ loadedData, setLoadedData ] = useState<TPrivateUserAlias | null>(null);

    useEffect(() => {
        if (loadedData !== null) return;

        startTransition(async () => {
            const data = await GetUserPrivateData();
            await new Promise(resolve => setTimeout(resolve, 1000));

            setLoadedData(data);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ loadedData ]);

    if (errorMessage) {
        return <ErrorComponent>{ errorMessage }</ErrorComponent>
    }

    return (
        <div
            className="bg-base-200 rounded-box p-4"
        >
            <FormComponent
                isPending={isPending}
                data={loadedData}
            />
        </div>
    )
}

function ErrorComponent({ children, className, ...rest }: React.ComponentPropsWithRef<'div'>) {
    return (
        <div
            className={cn(
                "",
                className
            )}
            {...rest}
        >
            { children }
        </div>
    )
};

function FormComponent({
    data,
    isPending
}: {
    data: TPrivateUserAlias | null,
    isPending: boolean
}) {
    const methods = useForm<z.infer<typeof UserAccountForm>>({
        resolver: zodResolver(UserAccountForm)
    });

    const onSubmit = (data: z.output<typeof UserAccountForm>) => {
        console.log(data);
    }

    const { handleSubmit } = methods;

    return (
        <FormProvider { ...methods }>
            <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2">
                <h1 className="font-bold">
                    Change account settings
                </h1>
                { isPending && <p>Loading data...</p> }

                <FieldSet
                    name="password"
                    label="Current password (*)"
                    as={Input}
                    disabled={isPending}
                    type="password"
                />

                <FieldSet
                    name="newPassword"
                    label="New password"
                    as={Input}
                    disabled={isPending}
                    type="password"
                />

                <FieldSet
                    name="newPasswordConfirm"
                    label="Confirm new password"
                    as={Input}
                    disabled={isPending}
                    type="password"
                />

                <AwaitedFieldSet
                    name="email"
                    label="E-mail (*)"
                    as={Input}
                    disabled={isPending}
                    value={data?.email}
                />

                <p className="text-sm opacity-75">
                    Fields marked with an asterisk (*) are required.
                </p>

                <Button
                    type="submit"
                >
                    Submit changes
                </Button>
            </div>
            </form>
        </FormProvider>
    )
}
