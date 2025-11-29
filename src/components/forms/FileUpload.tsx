import { useEffect, useRef, useState, useContext, createContext } from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";

import Button from "@/components/button";
import GlobalConfig from "@/lib/globalConfig";
import { useFormContext, get } from "react-hook-form";
import { cn, formatFileSize, ServerPathHelper as SPH } from "@/lib/utils";

import {
    X as XIcon,
    Trash2 as DeleteIcon,
    type LucideIcon
} from "lucide-react";
import ImagePromise from "@/components/common/ImagePromise";

const MAX_FILE_AMOUNT = GlobalConfig.MaxImagesPerListing;

export type FileMetadata = {
    file: File,
    urlPreview?: string,
}

const CTX = createContext<{
    filesToDelete: string[]
}>({
    filesToDelete: []
});

type TFileHandlerAction = (id: number, action: "delete" | "setAsMain") => void;

export default function FileUploadInput({
    name,
    children,
    'aria-invalid': ariaInvalid,
    defaultValue,
    disabled = false
}: {
    name: string,
    children?: React.ReactNode,
    'aria-invalid'?: boolean,
    defaultValue?: string[] // These are files already on the server,
    disabled?: boolean
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [ selectedFiles, setSelectedFiles ] = useState<FileMetadata[]>([]);
    const [ dummyFiles, setDummyFiles ] = useState<string[]>(defaultValue ?? []);
    const [ filesToDelete, setFilesToDelete ] = useState<string[]>([]);
    const [ mainImageId, setMainImageId ] = useState<number>(0);
    const { register, unregister, formState: { errors }, setValue } = useFormContext();

    useEffect(() => {
        if (defaultValue !== undefined && defaultValue.length !== 0) {
            setDummyFiles(defaultValue);
        }
    }, [defaultValue]);

    const currentFileAmount = selectedFiles.length + (dummyFiles?.length ?? 0);

    const handleClick = () => {
        fileInputRef.current?.click();
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        if ((files.length + currentFileAmount) > MAX_FILE_AMOUNT) {
            alert(`Only up to ${MAX_FILE_AMOUNT} files are allowed.`);
            return;
        }

        const filesWithMetadata: FileMetadata[] = Array.from(files).map(file => ({ file: file }));

        selectedFiles?.forEach(file => { if (file.urlPreview !== undefined) { URL.revokeObjectURL(file.urlPreview) } });
        filesWithMetadata.forEach(file => {
            const url = URL.createObjectURL(file.file);
            file.urlPreview = url;
        });

        setSelectedFiles(prev => {
            const newVal = [...prev, ...filesWithMetadata];
            const strippedNewVal = newVal.map(f => f.file);
            setValue(name, strippedNewVal, { shouldValidate: true, shouldDirty: true });
            return newVal;
        });
    }

    const handleListDeletion = (id: number) => {
        if (id > currentFileAmount) return;

        if (id < dummyFiles.length) {
            const guid = dummyFiles.at(id);
            if (!guid) return;

            if (filesToDelete.includes(guid)) {
                setFilesToDelete(prev => prev.filter(x => x !== guid));

                if (id + 1 < currentFileAmount) {
                    setMainImageId(id + 1);
                } else {
                    setMainImageId(Math.max(0, id - 1));
                }
            } else {
                setFilesToDelete(prev => [...prev, guid ]);
            }

            return;
        }

        setSelectedFiles(prev => prev.filter((_, idx) => id !== idx + dummyFiles.length));

        if (mainImageId >= id)
            setMainImageId(prev => Math.max(0, prev - 1));
    }

    const handleSelectAsMainImage = (id: number) => {
        if (id < 0 || id > currentFileAmount) return;

        setMainImageId(id);
    }

    const fileActionHandler: TFileHandlerAction = (id, action) => {
        switch (action) {
            case "delete":
                return handleListDeletion(id);

            case "setAsMain":
                return handleSelectAsMainImage(id);

            default:
                return;
        }
    }

    useEffect(() => {
        register(name);

        return () => unregister(name);
    }, [register, name, unregister]);

    return (
        <CTX value={{ filesToDelete }}>
        <div className="flex items-end gap-4">
            <input
                type="file"
                multiple
                accept="image/jpeg, image/jpg, image/png, image/webp"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileChange}
            />

            <div className="hidden">
                { children }
            </div>

            <div
                className={cn(
                    "flex flex-col gap-2 p-1 grow-1 shrink-1 rounded-box border border-base-300",
                    ariaInvalid && "ring-2 ring-destructive-content"
                )}
            >
                { currentFileAmount !== 0
                    ? (
                        <>
                        <div className="flex flex-wrap gap-2">
                            { (dummyFiles?.length ?? 0) > 0 && (
                                <div className="flex flex-col">
                                    <div className="flex flex-wrap p-2 gap-2 border border-base-500 rounded-box">
                                        { dummyFiles.map((path, idx) => (
                                            <FileUploadPreview
                                                isDummy
                                                key={idx}
                                                idx={idx}
                                                url={path}
                                                actionHandler={fileActionHandler}
                                                selectedMainId={mainImageId}
                                                deletionListState={filesToDelete}
                                            />
                                        )) }
                                    </div>

                                    <h1
                                        className="bg-base-500 text-base-200 text-sm leading-none font-bold px-2 py-1 mx-2 rounded-b-box self-start"
                                    >
                                        Current images
                                    </h1>
                                </div>
                            )}
                            {selectedFiles.map((file, idx) => (
                                <FileUploadPreview
                                    key={idx}
                                    url={file.urlPreview}
                                    file={file.file}
                                    isError={!!(get(errors, `${name}.${idx}`))}
                                    idx={idx + dummyFiles.length}
                                    actionHandler={fileActionHandler}
                                    selectedMainId={mainImageId}
                                />
                            ))}
                        </div>

                        <p>
                            Selected: { currentFileAmount ?? 0 } / { MAX_FILE_AMOUNT }
                        </p>
                        </>
                    )
                    : disabled ? null : (
                        <p className="px-2 py-1 text-sm opacity-75">No files selected. Valid formats: .jpeg, .jpg, .png and .webp.</p>
                    )
                }
            </div>

            <Button
                onClick={handleClick}
                className="grow-0 shrink-0"
                disabled={currentFileAmount >= MAX_FILE_AMOUNT}
            >
                Upload files...
            </Button>
        </div>
        </CTX>
    )
}

function FileUploadPreview({
    file,
    url,
    isError,
    isDummy = false,
    idx,
    actionHandler,
    selectedMainId,
    deletionListState
}: {
    file?: File | null,
    url?: string,
    isError?: boolean,
    isDummy?: boolean,
    idx: number,
    actionHandler: TFileHandlerAction,
    selectedMainId: number,
    deletionListState?: string[]
}) {
    const formattedSize = formatFileSize(file?.size ?? 0);

    const isMainImage = selectedMainId === idx;
    const isFlaggedForDeletion = isDummy
        ? (deletionListState && deletionListState.includes(url as string))
        : false;

    const imagePath = isDummy ? SPH.ProductThumbnailPath(url as string) : url;

    const handleItemDeletion = () => {
        actionHandler?.(idx, "delete");
    }

    const handleSelectAsMain = () => {
        actionHandler?.(idx, "setAsMain");
    }

    const handleFocusKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Delete" || e.key === "Backspace") {
            handleItemDeletion();
        }
    }

    return (
        <ContextMenu.Root>
            <ContextMenu.Trigger>
                <div
                    className={cn(
                        "w-32 relative text-sm rounded-box bg-base-100 inline-flex flex-col outline-none transition-all self-start group overflow-hidden shadow-sm",
                        isError === true ? "ring-3 ring-destructive-content" : "focus:ring-3 hover:ring-3 ring-base-500",
                        isFlaggedForDeletion ? "outline-2 outline-solid outline-destructive-content bg-destructive" : (isMainImage === true && "outline-1 outline-solid outline-primary-300 bg-primary-500")
                    )}
                    tabIndex={0}
                    onKeyDown={handleFocusKeyDown}
                >
                    <div className="relative flex justify-center p-1 pb-0">
                        <ImagePromise src={imagePath} className={cn("size-full rounded-box", isFlaggedForDeletion && "opacity-50")} />
                    </div>

                    <div className="relative">
                        <div className="text-base-500/75 px-2 py-1 text-center">
                            <p className="truncate">
                                { (isDummy ? url : file?.name) ?? "UNDEFINED" }
                            </p>

                            <p>
                                ({ formattedSize })
                            </p>
                        </div>
                    </div>
                        
                    { ( isFlaggedForDeletion || isMainImage ) && (
                        <div className={cn(
                            "rounded-b-box px-1 py-0.5 text-center",
                            isFlaggedForDeletion ? "bg-destructive-content" : "bg-primary-300"
                        )}>
                            <p className="text-primary-content font-bold">
                                { isFlaggedForDeletion ? "DELETE" : "main image"}
                            </p>
                        </div>
                    )}

                    { !isDummy && (<div
                        onClick={handleItemDeletion}
                        className="absolute top-1 right-1 p-1 bg-base-500 text-base-200 rounded-full opacity-50 size-8 group-hover:size-12 group-focus:size-12 group-focus:opacity-100 group-hover:opacity-100 hover:bg-destructive-content hover:text-destructive transition-all"
                    >
                        <XIcon className="size-full" />
                    </div>)}
                </div>
            </ContextMenu.Trigger>

            <ContextMenu.Portal>
                <ContextMenu.Content
                    className="flex flex-col bg-base-200 border border-base-300 shadow-sm rounded-box p-0.5 text-sm select-none"
                >
                    <ContextMenuItem
                        disabled={isMainImage || isFlaggedForDeletion}
                        onClick={handleSelectAsMain}
                    >
                        Set as display image
                    </ContextMenuItem>

                    <ContextMenuItem
                        variant={isFlaggedForDeletion ? "default" : "destructive"}
                        onClick={handleItemDeletion}
                        icon={DeleteIcon}
                    >
                        {isFlaggedForDeletion ? "Undo deletion" : "Remove image"}
                    </ContextMenuItem>
                </ContextMenu.Content>
            </ContextMenu.Portal>
        </ContextMenu.Root>
    )
}

function ContextMenuItem({
    children,
    className,
    variant = "default",
    icon: Icon,
    ...rest
}: React.ComponentPropsWithRef<typeof ContextMenu.Item> & {
    variant?: "default" | "destructive",
    icon?: LucideIcon
}) {
    const variantClasses = {
        default: "data-[highlighted]:bg-primary-300 data-[highlighted]:text-primary-content",
        destructive: "text-destructive-content data-[highlighted]:bg-destructive-content data-[highlighted]:text-destructive"
    }
    const vClassName = Object.hasOwn(variantClasses, variant) ? variantClasses[variant] : null;
    return (
        <ContextMenu.Item
            className={cn(
                "rounded-box-inner flex items-center h-6 pl-1 pr-2 data-[disabled]:opacity-50 outline-none leading-none",
                vClassName,
                className
            )}
            {...rest}
        >
            <div
                data-slot="icon-slot"
                className="flex items-center w-6 [&>svg]:size-4"
            >
                { Icon && <Icon /> }
            </div>
            { children }
        </ContextMenu.Item>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const FileUploadAttachments = {
    FlaggedForDeletion({ name }: { name: string }) {
        const { setValue } = useFormContext();
        const { filesToDelete } = useContext(CTX);

        useEffect(() => {
            setValue(name, filesToDelete, { shouldDirty: true });
        }, [setValue, name, filesToDelete]);

        return null;
    },
};