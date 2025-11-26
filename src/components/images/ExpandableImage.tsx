import ImagePromise from "@/components/common/ImagePromise";
import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import { X as XIcon } from "lucide-react";

export type ExpandableImageProps = Omit<React.ComponentPropsWithRef<'img'>, 'src'> & {
    imgSrc?: string;
    imgThumbnailSrc?: string;
}

export default function ExpandableImage({
    imgSrc,
    alt,
    className,
    ...rest
}: ExpandableImageProps) {
    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <ImagePromise
                    src={imgSrc}
                    alt={alt}
                    className={className}
                    fallback="error"
                    loadingComponent={SuspenseThumbnail({ className })}
                    {...rest}
                />
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay
                    className="fixed inset-0 bg-black/50 w-full h-full"
                />
                <Dialog.Content className="relative max-h-dvh">
                    <div className="fixed top-0 left-1/2 -translate-x-1/2 h-full flex flex-col overflow-scroll">
                        <ImagePromise
                            src={imgSrc}
                            alt="Expanded image"
                            className="grow-0 shrink-0"
                            fallback="error"
                            loadingComponent="loading"
                        />
                    </div>

                    <Dialog.Close className="fixed top-4 right-4 p-2 bg-base-300 rounded-full cursor-pointer">
                        <XIcon size={32} />
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

export function SuspenseThumbnail({
    className,
    ...rest
}: React.ComponentPropsWithRef<'div'>) {
    return (
        <div
            className={cn(
                "inline-block size-full shimmer",
                className
            )}
            {...rest}
        />
    )
}