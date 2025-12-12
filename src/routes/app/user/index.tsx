import z from "zod";

import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from "react";
import { useServerAction } from "@/hooks";
import { GetUserPrivateData, UpdateAccountDetails, UploadImageAvatar } from "@/lib/actions/userAction";
import { ServerImagePath } from "@/lib/serverRequest";
import type { paths } from "@/api/schema";
import { cn, formatFileSize } from "@/lib/utils";

import { UserAccountForm } from "@/models/schemas";
import { createAwaitedFieldSet } from "@/components/forms/AwaitedFieldSet";
import { FieldSet, Input } from "@/components/forms";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import UserAvatar from "@/components/common/UserAvatar";
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

    const invalidateData = () => {
        setLoadedData(null);
    }

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

            <FormImageUpload
                isPending={isPending}
                userId={loadedData?.id}
                dataInvalidateFn={invalidateData}
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

type TImageUploadMetadata = {
    file: File,
    url?: string
}

function FormImageUpload({
    userId,
    isPending: isParentPending,
    dataInvalidateFn,
}: {
    userId?: string,
    isPending: boolean,
    dataInvalidateFn: () => void
}) {
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const [ selectedImage, setSelectedImage ] = useState<TImageUploadMetadata | null>(null);
    const inputFileRef = useRef<HTMLInputElement>(null);
    const [ isPending, startTransition, errorMessage ] = useServerAction();
    const [ stateKey, setStateKey ] = useState<number>(0);

    const triggerFileSelection = () => {
        if (!inputFileRef.current) return;

        inputFileRef.current.click();
    }

    const freeImageMemory = () => {
        if (selectedImage !== null && selectedImage.url !== undefined) {
            URL.revokeObjectURL(selectedImage.url);
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files === null || files.length === 0) return;
        const file = files[0];

        if (file.size > MAX_FILE_SIZE) {
            alert(`File exceeds maximum allowed file size (${formatFileSize(MAX_FILE_SIZE)}).`);
            return;
        }

        freeImageMemory();

        const urlPreview = URL.createObjectURL(file);

        setSelectedImage({
            file: file,
            url: urlPreview
        });
    }

    const handleSubmit = () => {
        if (isParentPending || isPending || selectedImage === null) return;

        startTransition(async () => {
            await UploadImageAvatar(selectedImage.file);
            setSelectedImage(null);
            freeImageMemory();
            setStateKey(s => s+1);
        });
    }

    useEffect(() => {
        return () => freeImageMemory();
    });

    return (
        <div
            className="flex flex-col w-[256px]"
        >
            <div className="flex flex-col gap-2">
                <h1
                    className="font-bold"
                >
                    Profile image
                </h1>

                <UserAvatar userId={userId} size={256} cacheBust={stateKey} />
            </div>

            <Separator orientation="horizontal" />

            <div className="flex flex-col gap-2">
                <h1
                    className="font-bold"
                >
                    Upload new profile image
                </h1>

                { <FormErrorComponent>{errorMessage}</FormErrorComponent> }

                <p className="text-sm opacity-75">
                    Accepted formats: .jpg, .jpeg, .png and .webp.
                </p>

                { selectedImage && (
                    <div
                        className="relative size-[256px] flex items-center justify-center bg-base-400 rounded-box overflow-hidden"
                    >
                        <ImagePromise
                            src={selectedImage.url}
                            fallback="Error loading image"
                            className="size-full object-contain"
                        />

                        <div className="absolute top-2 left-2 rounded-box px-1 py-0.5 text-sm font-medium bg-base-200/75 text-base-500 shadow-xs">
                            Preview
                        </div>
                    </div>
                ) }

                <div className="flex flex-col gap-2 w-full">
                    <div
                        className="flex items-center px-3 py-1 rounded-field grow-1 shrink-1 border border-base-300 self-stretch overflow-hidden text-sm"
                    >
                            { selectedImage === null ? (
                                <p className="opacity-50">No file selected.</p>
                            ) : (
                                <p className="truncate">
                                    <span className="sr-only">Selected file: </span>
                                    {selectedImage.file.name}
                                </p>
                            )}
                    </div>

                    <Button
                        onClick={triggerFileSelection}
                        className="grow-0 shrink-0"
                    >
                        Select file...
                    </Button>
                </div>

                <Button
                    disabled={selectedImage === null || isParentPending === true}
                    className="btn-primary"
                    onClick={handleSubmit}
                >
                    Upload
                </Button>

                <input
                    ref={inputFileRef}
                    type="file"
                    accept="image/jpeg, image/jpg, image/png, image/webp"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />
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