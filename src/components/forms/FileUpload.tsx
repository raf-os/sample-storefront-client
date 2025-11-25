import { useEffect, useRef, useState } from "react";
import Button from "@/components/button";
import GlobalConfig from "@/lib/globalConfig";
import { useFormContext, get } from "react-hook-form";
import { cn, formatFileSize } from "@/lib/utils";
import { X as XIcon } from "lucide-react";

const MAX_FILE_AMOUNT = GlobalConfig.MaxImagesPerListing;

export type FileMetadata = {
    file: File,
    urlPreview?: string,
}

export default function FileUploadInput({
    name,
    'aria-invalid': ariaInvalid
}: {
    name: string,
    'aria-invalid'?: boolean
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [ selectedFiles, setSelectedFiles ] = useState<FileMetadata[]>([]);
    const { register, unregister, formState: { errors }, setError, setValue } = useFormContext();

    const handleClick = () => {
        fileInputRef.current?.click();
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        if ((files.length + selectedFiles.length) > MAX_FILE_AMOUNT) {
            setError(name, {
                type: "custom",
                message: `Only up to ${MAX_FILE_AMOUNT} image uploads are allowed.`
            });
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

    useEffect(() => {
        register(name);

        return () => unregister(name);
    }, [register, name, unregister]);

    return (
        <div className="flex items-end gap-4">
            <input
                type="file"
                multiple
                accept="image/jpeg, image/jpg, image/png, image/webp"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileChange}
            />

            <div
                className={cn(
                    "flex flex-col gap-2 p-1 grow-1 shrink-1 rounded-box border border-base-300",
                    ariaInvalid && "ring-2 ring-destructive-content"
                )}
            >
                { selectedFiles.length !== 0
                    ? (
                        <>
                        <div className="flex flex-wrap gap-2">
                        {selectedFiles.map((file, idx) => (
                            <FileUploadPreview
                                key={idx}
                                url={file.urlPreview}
                                file={file.file}
                                isError={!!(get(errors, `${name}.${idx}`))}
                            />
                        ))}
                        </div>

                        <p>
                            Selected: { selectedFiles?.length ?? 0 } / { MAX_FILE_AMOUNT }
                        </p>
                        </>
                    )
                    : (
                        <p className="px-2 py-1 text-sm opacity-75">No files selected. Valid formats: .jpeg, .jpg, .png and .webp.</p>
                    )
                }
            </div>

            <Button
                onClick={handleClick}
                className="grow-0 shrink-0"
            >
                Upload files...
            </Button>
        </div>
    )
}

function FileUploadPreview({
    file,
    url,
    isError
}: {
    file?: File | null,
    url?: string,
    isError?: boolean
}) {
    const formattedSize = formatFileSize(file?.size ?? 0);
    return (
        <div
            className={cn(
                "min-w-48 relative text-sm rounded-box bg-base-100 inline-flex flex-col p-1 outline-none transition-all self-start",
                isError === true ? "ring-2 ring-destructive-content bg-destructive" : "focus:ring-2 hover:ring-2 ring-base-500"
            )}
        >
            <img
                src={url}
                className="max-w-48 max-h-48 rounded-box"
            />

            <div className="opacity-75 px-1 py-0.5 text-center">
                <p>
                    { file?.name ?? "UNDEFINED" }
                </p>

                <p>
                    ({ formattedSize })
                </p>
            </div>

            <div className="absolute top-1 right-1 p-1 bg-base-500 text-base-200 rounded-full hover:bg-destructive-content hover:text-destructive transition-colors"><XIcon size="1.5rem" /></div>
        </div>
    )
}