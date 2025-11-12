import { z } from "zod";

import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import fakeProductList, { type ProductProps } from "@/lib/fakes/products";
import PageSetup from "@/components/layout/PageSetup";
import Button from "@/components/button";
import ExpandableImage from "@/components/images/ExpandableImage";
import { cn } from "@/lib/utils";
import { GetProductById, type TProductListPageResponse } from "@/lib/actions/productActions";

import { ShoppingCart, Wallet } from "lucide-react";

// Todo: fetch from back end
// Todo: back end
const fetchItem = (itemId: string) => {
    const selectedItem = fakeProductList.find(prod => prod.id === itemId);
    return selectedItem;
}

export const Route = createFileRoute('/item/$itemId')({
    validateSearch: z.object({
        itemId: z.string()
    }),
    loaderDeps: ({ search: { itemId } }) => ({
        itemId,
    }),
    loader: async ({ deps: { itemId } }) => {
        const request = await GetProductById(itemId);
        if (!request.success) throw new Error(request.message);

        const data = request.data!;

        return {
            data: data
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
                className="flex flex-col gap-4 w-2/3 h-full p-4 bg-base-200 rounded-box"
            >
                <ProductImageViewer
                    displayImage={product.displayImage}
                    imageList={product.imageList}
                />
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
                        <ShoppingCart />
                        Add to cart
                    </Button>

                    <Button
                        className="btn-primary"
                    >
                        <Wallet />
                        Buy now
                    </Button>
                </div>
            </div>
        </div>
    )
}

function ProductImageViewer({
    displayImage,
    imageList = []
}: {
    displayImage?: string,
    imageList?: string[]
}) {
    const [ selectedImg, setSelectedImg ] = useState<number>(0);

    let productImages = [];
    if (displayImage) productImages.push(displayImage);
    if (imageList.length > 0) {
        productImages = [ ...productImages, ...imageList ];
    }

    const handleImageSelection = (index: number) => {
        setSelectedImg(index);
    }

    return (
        <>
            <div className="flex justify-center max-h-128 object-contain">
                <ExpandableImage
                    imgSrc={`/images/products/${productImages[selectedImg]}`}
                    className="cursor-pointer"
                />
            </div>

            <div
                className="flex gap-4 h-28 bg-base-100 p-4 rounded-box"
            >
                { productImages.map((i, idx) => (
                    <img
                        src={`/images/products/${i}`}
                        key={`product-image-${idx}`}
                        className={cn(
                            "cursor-pointer w-24 object-scale-down",
                            (selectedImg === idx) ? "outline-2 outline-offset-2 outline-base-500" : "opacity-50"
                        )}
                        onClick={() => handleImageSelection(idx)}
                    />
                )) }
            </div>
        </>
    )
}
