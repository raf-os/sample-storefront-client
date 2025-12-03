import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, type ErrorComponentProps } from "@tanstack/react-router";
import PageSetup from "@/components/layout/PageSetup";
import Button from "@/components/button";
import ImagePromise from "@/components/common/ImagePromise";
import ExpandableImage, { SuspenseThumbnail } from "@/components/images/ExpandableImage";
import { cn } from "@/lib/utils";
import { GetProductById, GetProductComments } from "@/lib/actions/productActions";
import { useInView, useServerAction } from "@/hooks";

import { ShoppingCart, Star, Wallet } from "lucide-react";
import type { TComment } from "@/models";
import type { WithRequired } from "@/types/utilities";
import { NewReviewForm } from "@/components/unique/listings/NewReviewForm";
import GlobalConfig from "@/lib/globalConfig";

import {
    LoaderCircle
} from "lucide-react";

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
                { (product.imageIds && product.imageIds.length !== 0) ? (
                    <ProductImageViewer
                        imageList={product.imageIds}
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
                    imgSrc={`${GlobalConfig.ServerEndpoints.ProductImages}/${productImages[selectedImg]}`}
                    imgThumbnailSrc={`${GlobalConfig.ServerEndpoints.ProductImageThumbnails}/${productImages[selectedImg]}`}
                    className="cursor-pointer"
                />
            </div>

            <div
                className="flex gap-4 h-28 bg-base-100 p-4 rounded-box"
            >
                { productImages.map((i, idx) => (
                    <ImagePromise
                        src={`${GlobalConfig.ServerEndpoints.ProductImageThumbnails}/${i}`}
                        loadingComponent={<SuspenseThumbnail className="w-24" />}
                        fallback="error"
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

type TPaginationData = {
    lastIndex?: string,
    lastDate?: number
}

function ProductCommentSection() {
    const [ isPending, startTransition, errorMessage, isSuccess ] = useServerAction();
    const [ paginationData, setPaginationData ] = useState<TPaginationData | null>(null);
    const [ isPaginationEnd, setIsPaginationEnd ] = useState<boolean>(false);
    const [ userHasCommented, setUserHasCommented ] = useState<boolean>(false);
    const [ loadedComments, setLoadedComments ] = useState<WithRequired<TComment, 'user'>[] | null>(null);
    const productId = Route.useLoaderData().id;

    const triggerRef = useInView<HTMLDivElement>(() => onComponentVisible(), {}, [isPending, isPaginationEnd]);

    const onComponentVisible = useCallback(() => {
        if (isPaginationEnd || isPending) return;

        startTransition(async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const data = await GetProductComments(productId, paginationData?.lastIndex, paginationData?.lastDate);

            if (!data.success) {
                setLoadedComments([]);
                throw new Error(data.message);
            }
            console.log(data.data)
            
            const comments = data.data?.comments;
            setLoadedComments(prev => {
                const newComments = comments ?? [];
                if (prev === null) return newComments;
                else return [...prev, ...newComments];
            });

            if (data.data?.hasCommented === true) setUserHasCommented(true);

            if (data.data?.isEndOfList === true) {
                setIsPaginationEnd(true);
                return;
            }

            if (comments && comments.length !== 0) {
                const lastComment = comments.at(-1);
                setPaginationData({
                    lastIndex: lastComment?.id,
                    lastDate: lastComment?.postDate
                });
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPending, isPaginationEnd, paginationData?.lastDate, paginationData?.lastIndex]);

    return (
        <div
            className="flex flex-col gap-4"
        >
            { errorMessage && (
                <p>
                    { errorMessage }
                </p>
            )}

            { errorMessage ? null : loadedComments && (
                    <>
                    { userHasCommented === false && (<NewReviewForm productId={productId} />) }

                    <div className="flex flex-col gap-4 rounded-box bg-base-200 p-4">
                        <h1 className="text-lg font-semibold">
                            User reviews
                        </h1>

                        { (loadedComments.length > 0)
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

            { (errorMessage === null && isPaginationEnd === false) && (
                <div
                    className="flex gap-2 border border-base-300 text-base-400 rounded-box p-2"
                    ref={triggerRef}
                >
                    <LoaderCircle className="animate-spin" />
                    <p>Loading more comments...</p>
                </div>
            )}
        </div>
    )
}

function ProductComment({
    comment
}: {
    comment: WithRequired<TComment, 'user'>
}) {
    const CategoryElement = ({ header, content }: { header: string, content: React.ReactNode }) => {
        return (
            <div className="flex flex-col gap-1 items-start">
                <h1 className="text-sm font-bold">{ header }</h1>
                { content }
            </div>
        )
    }

    return (
        <div
            className="flex border border-base-300 rounded-box shadow-xs"
        >
            <div
                className="w-42 border-r border-base-300 p-2"
            >
                <CategoryElement
                    header={"Reviewer"}
                    content={(
                        <p>
                            { comment.user.name }
                        </p>
                    )}
                />

               <CategoryElement
                    header={"Score"}
                    content={(
                        <>
                        <div className="inline-flex gap-1 px-2 py-1 bg-base-100 border border-base-300 shadow-xs rounded-box grow-0 shrink-0">
                            { [...Array(5)].map((_, idx) => (
                                <Star
                                    key={idx}
                                    size={18}
                                    className={cn(
                                        "stroke-1 stroke-base-500/50",
                                        idx > comment.score
                                            ? "fill-base-400"
                                            : "fill-amber-400"
                                    )}
                                />
                            )) }
                        </div>

                        <p className="sr-only">
                            { comment.score } out of 5 stars
                        </p>
                        </>
                    )}
                />
            </div>

            <div className="grow-1 shrink-1 p-4">
                { comment.content ? (
                    <p>
                        { comment.content }
                    </p>
                ): (
                    <p
                        className="text-base-400 text-sm italic"
                    >
                        User left no comment
                    </p>
                )}
            </div>
        </div>
    )
}
