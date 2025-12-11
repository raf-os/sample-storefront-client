import z from "zod";

import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from "react";
import { useServerAction } from "@/hooks";
import { GetUserPrivateData, UpdateAccountDetails } from "@/lib/actions/userAction";
import { ServerImagePath } from "@/lib/serverRequest";
import type { paths } from "@/api/schema";
import { cn } from "@/lib/utils";

import { UserAccountForm } from "@/models/schemas";
import { createAwaitedFieldSet } from "@/components/forms/AwaitedFieldSet";
import { FieldSet, Input } from "@/components/forms";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/button";
import Separator from "@/components/common/Separator";

import {
    Check as CheckIcon,
    OctagonAlert as AlertIcon
} from "lucide-react";
import ImagePromise from "@/components/common/ImagePromise";

export const Route = createFileRoute('/app/user/')({
    component: RouteComponent,
})

type TPrivateUserAlias = paths['/api/User/my-data']['get']['responses']['200']['content']['application/json'];

const AwaitedFieldSet = createAwaitedFieldSet<typeof UserAccountForm>();

function RouteComponent() {
    // const { authData } = useAuth();
    const [ isPending, startTransition, errorMessage ] = useServerAction();
    const [ loadedData, setLoadedData ] = useState<TPrivateUserAlias | null>(null);

    useEffect(() => {
        if (loadedData !== null) return;

        startTransition(async () => {
            const data = await GetUserPrivateData();
            // await new Promise(resolve => setTimeout(resolve, 1000));

            setLoadedData(data);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ loadedData ]);

    if (errorMessage) {
        return <ErrorComponent>{ errorMessage }</ErrorComponent>
    }

    return (
        <div
            className="flex justify-between bg-base-200 rounded-box p-4"
        >
            <div className="grow-1 shrink-1">
                <FormComponent
                    isPending={isPending}
                    data={loadedData}
                />
            </div>

            <Separator orientation="vertical"/>

            <div className="w-[320px]">
                <FormImageUpload
                    userId={loadedData?.id}
                />
            </div>
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
    isPending: isParentPending
}: {
    data: TPrivateUserAlias | null,
    isPending: boolean
}) {
    const [ isActionPending, startTransition, errorMessage, isSuccess ] = useServerAction();
    const methods = useForm<z.infer<typeof UserAccountForm>>({
        resolver: zodResolver(UserAccountForm)
    });

    const isPending = isActionPending || isParentPending;

    const onSubmit = (data: z.output<typeof UserAccountForm>) => {
        if (isPending) return;

        startTransition(async () => {
            await UpdateAccountDetails(data);
        });
    }

    const { handleSubmit } = methods;

    return (
        <FormProvider { ...methods }>
            <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2">
                <h1 className="font-bold">
                    Change account settings
                </h1>
                
                { isParentPending && <p>Loading data...</p> }
                { <FormErrorComponent>{ errorMessage }</FormErrorComponent> }
                { (isSuccess && !errorMessage) && (
                    <div className="flex gap-1 items-center bg-success border border-success-content/25 rounded-box px-2 py-1 text-sm text-success-content">
                        <CheckIcon size={18} /> <p>Settings changed successfully!</p>
                    </div>
                )}

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

function FormErrorComponent({ children, className, ...rest }: React.ComponentPropsWithRef<'p'>) {
    if (children === undefined || children === null) return null;
    return (
        <div
            className={cn(
                "flex gap-1 items-center text-sm text-error-content bg-error border border-error-content/25 rounded-box px-2 py-1",
                className
            )}
            {...rest}
        >
            <AlertIcon size={18} />
            { children }
        </div>
    )
}

function FormImageUpload({
    userId
}: {
    userId?: string
}) {
    return (
        <div>
            <h1>Profile picture</h1>

            <div className="object-contain aspect-square overflow-hidden rounded-box">
                { userId === undefined ? <FormImagePlaceHolder /> : (
                    <ImagePromise
                        src={ServerImagePath("/api/User/{Id}/avatar", { path: { Id: userId } })}
                        loadingComponent={<FormImagePlaceHolder />}
                        fallback="not found"
                        alt="User avatar"
                    />
                )}
            </div>
        </div>
    )
}

function FormImagePlaceHolder() {
    return (
        <div
            className="shimmer size-full"
        />
    )
}