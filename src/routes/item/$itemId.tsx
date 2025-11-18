import { useState } from "react";
import { createFileRoute, useLoaderData, type ErrorComponentProps } from "@tanstack/react-router";
import PageSetup from "@/components/layout/PageSetup";
import Button from "@/components/button";
import ExpandableImage from "@/components/images/ExpandableImage";
import { cn } from "@/lib/utils";
import { GetProductById, GetProductComments } from "@/lib/actions/productActions";
import { useInView } from "@/hooks";

import { ShoppingCart, Wallet } from "lucide-react";
import type { TComment } from "@/models";
import type { WithRequired } from "@/types/utilities";
import { NewReviewForm } from "@/components/unique/listings/NewReviewForm";

export const Route = createFileRoute('/item/$itemId')({
    loader: async ({ params }) => {
        const request = await GetProductById(params.itemId);
        if (!request.success) throw new Error(request.message);

        const data = request.data!;

        return data;
    },
    component: ItemPage,
    errorComponent: ErrorContent
});

function ItemPage() {
    return (
        <PageSetup
            mainContent={PageContent}
        />
    )
}

function ErrorContent({ error }: ErrorComponentProps) {
    return (
        <div
            className="w-1/2 mx-auto"
        >
            <h1
                className="text-lg font-semibold mb-4"
            >
                Error loading content
            </h1>
            <div
                className="border border-base-300 bg-base-200 rounded-box p-4"
            >
                { error.message }
            </div>
        </div>
    )
}

function PageContent() {
    const data = Route.useLoaderData();
    const product = data;

    if (product.discount === undefined) product.discount = 0;

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
        <>
        <div
            className="flex gap-4"
        >
            <div
                className="flex flex-col gap-4 w-2/3 h-full p-4 bg-base-200 rounded-box"
            >
                { (product.imageList && product.imageList.length !== 0) ? (
                    <ProductImageViewer
                        imageList={product.imageList}
                    />
                ) : (
                    <>
                        No images available.
                    </>
                )}
            </div>

            <div
                className="grow-1 shrink-1 flex flex-col h-full bg-base-200 rounded-box p-4"
            >
                <h1 className="font-bold text-lg">
                    { product.name }
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

        <NewReviewForm productId={data.id} />

        <ProductCommentSection />
        </>
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

function ProductCommentSection() {
    const [ loadedComments, setLoadedComments ] = useState<WithRequired<TComment, 'user'>[] | null>(null);
    const [ fetchError, setFetchError ] = useState<string | null>(null);
    const productId = Route.useLoaderData().id;
    const wrapperRef = useInView<HTMLDivElement>(() => onComponentVisible());

    const onComponentVisible = async () => {
        const data = await GetProductComments(productId);

        if (!data.success) {
            setFetchError(data.message ?? "Unknown error occurred.");
            setLoadedComments([]);
            return;
        }

        setFetchError(null);
        setLoadedComments(data.data ?? []);
    };

    return (
        <div
            className="flex flex-col gap-4 bg-base-200 rounded-box p-4"
            ref={wrapperRef}
        >
            <h1 className="text-lg font-semibold">
                User reviews
            </h1>

            { fetchError && (
                <p>
                    { fetchError }
                </p>
            )}

            { loadedComments === null
                ? (
                    <div>
                        Loading comments...
                    </div>
                ): fetchError ? null : (
                    <>
                    <div className="flex flex-col gap-4">
                        { loadedComments.length > 0
                            ? loadedComments?.map(comment => (
                                <ProductComment
                                    comment={comment}
                                    key={comment.id}
                                />
                            )) : (
                                <p>
                                    No reviews found.
                                </p>
                            )
                        }
                    </div>
                    </>
                )
            }
        </div>
    )
}

function ProductComment({
    comment
}: {
    comment: WithRequired<TComment, 'user'>
}) {
    return (
        <div>
            <h1>
                { comment.user.name }
            </h1>
        </div>
    )
}
