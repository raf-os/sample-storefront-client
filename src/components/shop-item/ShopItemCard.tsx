import { cn } from "@/lib/utils";

export type ShopItemCardProps = {
    itemName: string,
    itemPrice: number,
    itemDiscount?: number,
};

export default function ShopItemCard({
    itemName,
    itemPrice,
    itemDiscount=0
}: ShopItemCardProps) {

    const formatter = Intl.NumberFormat('en-us', {
        style: 'currency',
        currency: 'USD'
    });

    const originalPrice = formatter.format(itemPrice);

    const discountedPrice = formatter.format(itemPrice * (100 - itemDiscount) / 100);

    return (
        <li
            className="flex flex-col gap-2 group hover:bg-base-200/50 transition-colors border border-base-200 rounded-lg p-2 shadow-md"
        >
            <div className="grow-0 shrink-0 bg-base-200 h-42 w-full rounded-md" />

            <div className="grow-1 shrink-1 flex flex-col justify-between px-2 py-1">
                <div
                    className="flex flex-nowrap gap-2 font-medium items-start justify-between overflow-x-clip"
                >
                    <p
                        className="grow-1 shrink-1"
                    >
                        { itemName }
                    </p>
                    { (itemDiscount > 0) && (
                        <div className="grow-0 shrink-0 bg-warning text-warning-content text-sm py-[1px] px-2 rounded-field">
                            -{itemDiscount}%
                            <span className="sr-only"> discount</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 items-end justify-end">
                    { (itemDiscount > 0) && (
                        <>
                            <span className="sr-only">
                                Originally priced at:
                            </span>
                            <span
                                className="line-through text-muted"
                            >
                                { originalPrice }
                            </span>
                        </>
                    )}

                    <span className="sr-only">
                        Now priced at:
                    </span>

                    <span
                        className={cn(
                            "text-xl font-semibold text-primary-300",
                        )}
                    >
                        { discountedPrice }
                    </span>
                </div>
            </div>
        </li>
    )
}