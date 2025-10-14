import { Link } from "@tanstack/react-router";

export type ShopItemCardProps = {
    itemId: string,
    itemName: string,
    itemLabel: string,
    itemPrice: number,
    itemDiscount?: number,
    itemImage?: string,
};

export default function ShopItemCard({
    itemId,
    itemName,
    itemLabel,
    itemPrice,
    itemImage,
    itemDiscount=0
}: ShopItemCardProps) {

    const formatter = Intl.NumberFormat('en-us', {
        style: 'currency',
        currency: 'USD'
    });

    const originalPrice = formatter.format(itemPrice);

    const discountedPrice = formatter.format(itemPrice * (100 - itemDiscount) / 100);

    return (
        <Link
            to="/item/$itemId"
            params={{
                itemId: itemId
            }}
        >
        <li
            className="flex flex-col gap-2 group hover:outline hover:shadow-md outline-base-300 transition-colors rounded-box p-2"
            role="button"
        >
            <div className="relative grow-0 shrink-0 bg-base-200 h-64 w-full rounded-box-inner cursor-pointer overflow-hidden">
                { itemImage && <img src={`/images/products/${itemImage}`} className="object-cover object-center w-full h-full" /> }
            </div>

            <div className="grow-1 shrink-1 flex flex-col px-1 py-1">
                <div
                    className="flex flex-nowrap gap-2 font-semibold items-start justify-between overflow-clip mb-1"
                >
                    <p
                        className="grow-1 shrink-1 line-clamp-2"
                    >
                        { itemLabel }
                    </p>
                </div>

                <div className="flex flex-col">
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

                    <div
                        className="flex gap-2 items-center"
                    >
                        <span
                            className="text-xl font-semibold text-primary-300"
                        >
                            { discountedPrice }
                        </span>

                        { (itemDiscount > 0) && (
                            <div className="bg-warning text-warning-content text-sm font-medium py-[1px] px-2 rounded-field">
                                -{itemDiscount}%
                                <span className="sr-only"> discount</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </li>
        </Link>
    )
}