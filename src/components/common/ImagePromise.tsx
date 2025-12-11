import { useEffect, useState } from "react";

export type TImageProps = React.ComponentPropsWithRef<'img'> & {
    fallback?: React.ReactNode,
    loadingComponent?: React.ReactNode,
}

/**
 * Conditionally renders an image.
 * 
 * *fallback*: Rendered in case of invalid url
 * 
 * *loading*: Shown while the GET request is being made
 */
export default function ImagePromise({
    src,
    fallback,
    loadingComponent,
    ...rest
}: TImageProps) {
    const [ isSuccess, setIsSuccess ] = useState<boolean | null>(null);

    useEffect(() => {
        if (src === undefined || src === null)
            return;

        const img = new Image();
        img.src = src;

        img.onload = () => {
            setIsSuccess(true);
        }

        img.onerror = () => {
            setIsSuccess(false);
        }

        return () => {
            img.onload = null;
            img.onerror = null;
        }
    }, [src, fallback]);

    if (isSuccess === true)
        return (
            <img src={src} {...rest} />
        );
    else if (isSuccess === false)
        return (<>{fallback ?? null}</>);
    else
        return (<>{loadingComponent ?? null}</>);
}