import { cn } from "@/lib/utils";
import ImagePromise from "@/components/common/ImagePromise";
import { ServerImagePath } from "@/lib/serverRequest";

export default function UserAvatar({
    userId,
    className,
    style,
    size = 256,
    cacheBust
}: {
    userId?: string | undefined,
    className?: string,
    style?: React.CSSProperties,
    size?: number | null,
    cacheBust?: number
}) {
    return (
        <div
            className={cn(
                "flex items-center justify-center [&_img]:object-contain [&_img]:size-full",
                "max-w-[256px] max-h-[256px] overflow-hidden rounded-box bg-base-400",
                className
            )}
            style={{
                width: size ? `${size}px` : 'auto',
                height: size ? `${size}px` : 'auto',
                ...style
            }}
        >
            { userId === undefined ? <FormImagePlaceHolder /> : (
                <ImagePromise
                    src={ServerImagePath("/api/User/{Id}/avatar", { path: { Id: userId }, query: { t: String(cacheBust) } } as any)}
                    loadingComponent={<FormImagePlaceHolder />}
                    fallback={(
                        <img src="/images/default-avatar.webp" alt="Default user avatar" />
                    )}
                    alt="User avatar"
                />
            )}
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