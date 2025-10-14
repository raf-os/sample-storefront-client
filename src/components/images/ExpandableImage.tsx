import * as Dialog from "@radix-ui/react-dialog";
import { X as XIcon } from "lucide-react";

export type ExpandableImageProps = React.ComponentPropsWithRef<'img'> & {
    imgSrc?: string;
}

export default function ExpandableImage({
    imgSrc,
    alt,
    ...rest
}: ExpandableImageProps) {
    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <img src={imgSrc} alt={alt} {...rest} />
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay
                    className="fixed inset-0 bg-black/50 w-full h-full"
                    onClick={() => console.log("clicc")}
                />
                <Dialog.Content className="relative max-h-dvh">
                    <div className="fixed top-0 left-1/2 -translate-x-1/2 h-full flex flex-col overflow-scroll">
                        <img src={imgSrc} alt="Expanded image" className="grow-0 shrink-0" />
                    </div>

                    <Dialog.Close className="fixed top-0 right-0 p-3 bg-black rounded-full">
                        <XIcon size={32} />
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}