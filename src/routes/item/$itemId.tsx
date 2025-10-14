import { createFileRoute } from "@tanstack/react-router";
import fakeProductList, { type ProductProps } from "@/lib/fakes/products";

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
    const data = Route.useLoaderData();
    const product = data.data;
    return (product===undefined) ? (
        <>
            No product with provided ID found.
        </>
    ) : (
        <>
            <h1>{ product.label }</h1>
            <p>{ product.description===undefined ? `No description found.` : product.description }</p>
        </>
    )
}