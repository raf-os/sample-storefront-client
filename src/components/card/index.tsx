import { cn } from "@/lib/utils";

type CardRootProps = React.ComponentPropsWithRef<'div'>;

function CardRoot({
    children,
    className,
    ...rest
}: CardRootProps) {
    return (
        <div
            className={cn(
                "flex flex-col gap-2 p-4 bg-base-200 rounded-box shadow-sm",
                className
            )}
            {...rest}
        >
            {children}
        </div>
    )
}

type CardHeaderProps = React.ComponentPropsWithRef<'h1'>;

function CardHeader({
    children,
    className,
    ...rest
}: CardHeaderProps) {
    return (
        <h1
            className={cn(
                "font-semibold",
                className
            )}
            {...rest}
        >
            {children}
        </h1>
    )
}

type CardBodyProps = React.ComponentPropsWithRef<'div'>;

function CardBody({
    children,
    className,
    ...rest
}: CardBodyProps) {
    return (
        <div
            className={cn(
                "flex flex-col gap-4",
                className
            )}
            {...rest}
        >
            {children}
        </div>
    )
}

const Card = {
    Root: CardRoot,
    Header: CardHeader,
    Body: CardBody
}

export default Card;