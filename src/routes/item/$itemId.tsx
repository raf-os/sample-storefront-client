import { createFileRoute } from "@tanstack/react-router";
import fakeProductList, { type ProductProps } from "@/lib/fakes/products";
import PageSetup from "@/components/layout/PageSetup";
import Button from "@/components/button";

// Todo: fetch from back end
// Todo: back end
const fetchItem = (itemId: string) => {
    const selectedItem = fakeProductList.find(prod => prod.id === itemId);
    return selectedItem;
}

export const Route = createFileRoute('/item/$itemId')({
    loader: async ({params}) => {
        const itemData = fetchItem(params.itemId);
        return {
            data: itemData
        }
    },
    component: ItemPage
});

function ItemPage() {
    return (
        <PageSetup
            mainContent={PageContent}
        />
    )
}

function PageContent() {
    const data = Route.useLoaderData();
    const product = data.data;

    const formatter = Intl.NumberFormat('en-us', {
        style: 'currency',
        currency: 'USD'
    });

    const finalPrice = product
        ? (product.discount > 0)
            ? (product.price * (100 - product.discount) / 100)
            : product.price
        : 0;

    return (product===undefined) ? (
        <span className="text-muted">
            No product with provided ID found.
        </span>
    ) : (
        <div
            className="flex gap-4"
        >
            <div
                className="w-2/3 h-full bg-base-200 rounded-box"
            >
            </div>

            <div
                className="grow-1 shrink-1 flex flex-col h-full bg-base-200 rounded-box p-4"
            >
                <h1 className="font-bold text-lg">
                    { product.label }
                </h1>

                { product.description===undefined
                    ? <p className="text-muted">No description found.</p>
                    : (
                        <p>
                            { product.description }
                        </p>
                    )
                }

                <div
                    className="flex items-end gap-2 py-2"
                >
                    { (product.discount > 0) && (
                        <span
                            className="text-muted line-through leading-none"
                        >
                            {formatter.format(product.price)}
                        </span>
                    ) }
                    <span
                        className="font-bold text-primary-300 text-xl leading-none"
                    >
                        {formatter.format(finalPrice)}
                    </span>
                </div>

                <div className="flex flex-col gap-4 mt-2">
                    <Button>
                        Add to cart
                    </Button>

                    <Button
                        className="btn-primary"
                    >
                        Buy now
                    </Button>
                </div>
            </div>
        </div>
    )
}