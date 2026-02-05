import { useCallback, useContext, useRef, useState } from "react";
import { createFileRoute, Link, type ErrorComponentProps } from "@tanstack/react-router";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import PageSetup from "@/components/layout/PageSetup";
import Button from "@/components/button";
import ImagePromise from "@/components/common/ImagePromise";
import ExpandableImage, { SuspenseThumbnail } from "@/components/images/ExpandableImage";
import { cn, PreventLayoutFlash } from "@/lib/utils";
import { GetProductById, GetProductComments } from "@/lib/actions/productActions";
import { useInView, useServerAction } from "@/hooks";
import { AuthContext } from "@/authContext";

import type { TComment } from "@/models";
import type { Flatten, WithRequired } from "@/types/utilities";
import { NewReviewForm } from "@/components/unique/listings/NewReviewForm";
import GlobalConfig from "@/lib/globalConfig";
import { DropdownContent, DropdownItem, DropdownSeparator } from "@/components/common/Dropdown";

import {
  Plus as PlusIcon,
  Minus as MinusIcon,
  TriangleAlert
} from "lucide-react";

import {
  LoaderCircle,
  Ellipsis,
  ShoppingCart,
  Star,
  Wallet,
} from "lucide-react";
import { AddProductToCart } from "@/lib/actions/userAction";
import { queryClient, ServerImagePath } from "@/lib/serverRequest";
import { QueryKeys } from "@/lib/queryKeys";
import type { paths } from "@/api/schema";

export const Route = createFileRoute('/item/$itemId')({
  loader: async ({ params }) => {
    const data = await GetProductById(params.itemId);

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
        {error.message}
      </div>
    </div>
  )
}

function PageContent() {
  const data = Route.useLoaderData();
  const product = data;

  const { authData } = useContext(AuthContext);
  const [isPending, startTransition, errorMessage] = useServerAction();

  const customSelectorRef = useRef<HTMLDivElement>(null);

  if (product.discount === undefined) product.discount = 0;

  const formatter = Intl.NumberFormat('en-us', {
    style: 'currency',
    currency: 'USD'
  });

  const formattedScore =
    product.rating?.value === undefined
      ? "-"
      : new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0
      }).format(product.rating.value as number || 0);

  const finalPrice = product
    ? (product.discount && product.discount as number > 0)
      ? ((product.price as number || 0) * (100 - (product.discount as number)) / 100)
      : (product.price || 0)
    : 0;

  const isProductInStock =
    product.isInStock === true
    || (product.stockAmount && (product.stockAmount as number) > 0);

  const handleAddToCard = () => {
    console.log("call")
    if (isPending) return;
    const amt = customSelectorRef.current?.dataset.value;
    const pId = data.id;
    if (pId == undefined) {
      throw new Error("Product ID is undefined!");
    }

    startTransition(async () => {
      const data = await AddProductToCart(pId, amt);
      console.info(data);

      await queryClient.invalidateQueries({ queryKey: QueryKeys.User.CartSize });
    });
  }

  return (product === undefined) ? (
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
          {(product.imageIds && product.imageIds.length !== 0) ? (
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
          className="relative grow-1 shrink-1 flex flex-col h-full bg-base-200 rounded-box p-4"
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-bold text-lg">
                {product.name}
              </h1>

              <div
                className="flex items-end gap-2 py-2"
              >
                {(product.discount && (product.discount as number) > 0) && (
                  <span
                    className="text-muted line-through leading-none"
                  >
                    {formatter.format(product.price as number || 0)}
                  </span>
                )}
                <span
                  className="font-bold text-primary-300 text-xl leading-none"
                >
                  {formatter.format(finalPrice as number)}
                </span>

                <span>
                </span>
              </div>
            </div>

            {authData?.userId === product.userId && <ListingUserActions />}
          </div>

          <div>
            {product.user && (<>
              <h2>Sold by:</h2>
              <p>
                <Link to="/user/$userId" params={{ userId: product.user.id as string }}>
                  {product.user.name}
                </Link>
              </p>
            </>)}

            <h2>Score:</h2>
            <p>
              {formattedScore} / 5
              ({product.rating?.amount || 0} votes)
            </p>
          </div>

          <div className="text-sm">
            {isProductInStock ? (<>
              <span className="text-success-content">Product is currently in stock!</span>
              {product.stockAmount !== undefined && (
                <span className="text-base-500/75">{product.stockAmount} remaining.</span>
              )}
            </>) : (
              <span className="text-error-content">Product is not in stock at the moment.</span>
            )}
          </div>

          <div className="flex flex-col gap-4 mt-2">
            <div>
              <label
                className="text-sm font-bold"
              >
                Quantity
              </label>
              <CustomQuantitySelector ref={customSelectorRef} />
            </div>

            {product.isInCart === true && (
              <div className="flex gap-2 items-center text-primary-200 text-sm border border-primary-300 bg-primary-500 rounded-box p-2">
                <TriangleAlert
                  className="text-primary-300 size-6"
                />
                <p>This product is already in your cart.</p>
              </div>
            )}

            <Button
              disabled={isPending || !isProductInStock}
              onClick={handleAddToCard}
            >
              <ShoppingCart />
              Add to cart
            </Button>

            <Button
              className="btn-primary"
              disabled={isPending || !isProductInStock}
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

function CustomQuantitySelector({
  ref
}: React.ComponentPropsWithRef<'div'>) {
  const [value, setValue] = useState<number>(1);

  const handleValueChange = (newValue: string | number) => {
    let parsedValue = newValue;

    if (typeof parsedValue === "string") {
      parsedValue = parsedValue.replace(/[^0-9]/g, "");
      parsedValue = Number(parsedValue);
    }

    parsedValue = Math.min(99, Math.max(1, parsedValue));
    setValue(parsedValue);
  }

  function InnerButton({ children, className, ...rest }: React.ComponentPropsWithRef<'button'>) {
    return (
      <button
        className={cn(
          "flex grow-0 shrink-0 items-center justify-center bg-base-300 text-base-500 w-12 h-full [&_svg]:size-4 outline-0",
          "hover:bg-base-400 focus:bg-primary-400 transition-colors",
          className
        )}
        {...rest}
      >
        {children}
      </button>
    )
  }

  return (
    <div
      className="flex overflow-hidden rounded-field shadow-xs border border-base-300 h-9"
      ref={ref}
      data-value={value}
    >
      <InnerButton
        onClick={() => { handleValueChange(value - 1) }}
      >
        <MinusIcon />
      </InnerButton>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        className="grow-1 shrink-1 px-1 py-2 h-9 leading-none outline-none text-center bg-base-200"
        onChange={e => handleValueChange(e.target.value)}
        value={value}
      />

      <InnerButton
        onClick={() => handleValueChange(value + 1)}
      >
        <PlusIcon />
      </InnerButton>
    </div>
  )
}

function ListingUserActions() {
  const { itemId } = Route.useParams();

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <button
          className="p-1 flex items-center rounded-full bg-base-200 border border-base-400 text-base-500/75 shadow-xs focus:ring-4 ring-base-400"
          type="button"
        >
          <Ellipsis className="size-6" />
        </button>
      </Dropdown.Trigger>

      <Dropdown.Portal>
        <DropdownContent
          sideOffset={4}
          align="end"
        >
          <Link to="/app/user/products/edit/$itemId" params={{ itemId }}>
            <DropdownItem>
              Edit item
            </DropdownItem>
          </Link>

          <DropdownItem disabled>
            View analytics
          </DropdownItem>

          <DropdownSeparator />

          <DropdownItem variant="destructive">
            Delete item
          </DropdownItem>
        </DropdownContent>
      </Dropdown.Portal>
    </Dropdown.Root>
  )
}

function ProductImageViewer({
  displayImage,
  imageList = []
}: {
  displayImage?: string,
  imageList?: string[]
}) {
  const [selectedImg, setSelectedImg] = useState<number>(0);

  let productImages = [];
  if (displayImage) productImages.push(displayImage);
  if (imageList.length > 0) {
    productImages = [...productImages, ...imageList];
  }

  const handleImageSelection = (index: number) => {
    setSelectedImg(index);
  }

  return (
    <>
      <div className="flex justify-center max-h-128 object-contain">
        <ExpandableImage
          imgSrc={ServerImagePath("/api/Product/image/{imageId}", { path: { imageId: productImages[selectedImg] } })}
          imgThumbnailSrc={ServerImagePath("/api/Product/thumbnail/{thumbId}", { path: { thumbId: productImages[selectedImg] } })}
          className="cursor-pointer"
        />
      </div>

      <div
        className="flex gap-4 h-28 bg-base-100 p-4 rounded-box"
      >
        {productImages.map((i, idx) => (
          <ImagePromise
            src={`${GlobalConfig.ServerEndpoints.ProductImageThumbnails}/${i}`}
            loadingComponent={<SuspenseThumbnail className="w-24" />}
            fallback="Error fetching image."
            key={`product-image-${idx}`}
            className={cn(
              "cursor-pointer w-24 object-scale-down",
              (selectedImg === idx) ? "outline-2 outline-offset-2 outline-base-500" : "opacity-50"
            )}
            onClick={() => handleImageSelection(idx)}
          />
        ))}
      </div>
    </>
  )
}

type TPaginationData = {
  lastIndex?: string,
  lastDate?: string
}

type TCommentPayloadAlias = paths['/api/Comment/{Id}']['get']['responses']['200']['content']['application/json'];

type TCommentData = Required<TCommentPayloadAlias['comments']>;

type TCommentUnit = Omit<Exclude<Required<Flatten<TCommentData>>, undefined>, "product">;

type TCommentList = TCommentUnit[];

function ProductCommentSection() {
  const [isPending, startTransition, errorMessage] = useServerAction();
  const [paginationData, setPaginationData] = useState<TPaginationData | null>(null);
  const [isPaginationEnd, setIsPaginationEnd] = useState<boolean>(false);
  const [userHasCommented, setUserHasCommented] = useState<boolean>(false);
  const [loadedComments, setLoadedComments] = useState<TCommentList | null>(null);
  const productId = Route.useLoaderData().id;

  const triggerRef = useInView<HTMLDivElement>(() => onComponentVisible(), {}, [isPending, isPaginationEnd]);

  const onComponentVisible = useCallback(() => {
    if (isPaginationEnd || isPending) return;
    if (productId == undefined) return;

    startTransition(async () => {
      const data = await PreventLayoutFlash(
        GetProductComments(productId, paginationData?.lastIndex, paginationData?.lastDate)
      );
      console.log(data)

      const comments = data.comments;
      if (comments && comments.length > 0) {
        setLoadedComments(prev => {
          if (prev === null) return comments as any; // TODO: Type this correctly
          else return [...prev, ...comments];
        });
      } else {
        setLoadedComments([]);
      }

      if (data.hasCommented === true) setUserHasCommented(true);

      if (data.isEndOfList === true) {
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
      {(errorMessage !== null && loadedComments === null) && (
        <FetchErrorMessage>
          {errorMessage}
        </FetchErrorMessage>
      )}

      {loadedComments && productId && (
        <>
          {userHasCommented === false && (<NewReviewForm productId={productId} disabled={!!errorMessage} />)}

          <div className="flex flex-col gap-4 rounded-box bg-base-200 p-4">
            <h1 className="text-lg font-semibold">
              User reviews
            </h1>

            {(loadedComments.length > 0)
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

            {errorMessage && (
              <FetchErrorMessage>
                {errorMessage}
              </FetchErrorMessage>
            )}
          </div>
        </>
      )
      }

      {(errorMessage === null && isPaginationEnd === false) && (
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

function FetchErrorMessage({ children }: { children?: React.ReactNode }) {
  return (
    <div className="text-error-content border border-error-content rounded-box bg-error px-4 py-2">
      {children}
    </div>
  )
}

function ProductComment({
  comment
}: {
  comment: TCommentUnit
}) {
  const CategoryElement = ({ header, content }: { header: string, content: React.ReactNode }) => {
    return (
      <div className="flex flex-col gap-1 items-start">
        <h1 className="text-sm font-bold">{header}</h1>
        {content}
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
              {comment.user?.name}
            </p>
          )}
        />

        <CategoryElement
          header={"Score"}
          content={(
            <>
              <div className="inline-flex gap-1 px-2 py-1 bg-base-100 border border-base-300 shadow-xs rounded-box grow-0 shrink-0">
                {[...Array(5)].map((_, idx) => (
                  <Star
                    key={idx}
                    size={18}
                    className={cn(
                      "stroke-1 stroke-base-500/50",
                      idx >= Number(comment.score)
                        ? "fill-base-400"
                        : "fill-amber-400"
                    )}
                  />
                ))}
              </div>

              <p className="sr-only">
                {comment.score} out of 5 stars
              </p>
            </>
          )}
        />
      </div>

      <div className="grow-1 shrink-1 p-4">
        {comment.content ? (
          <p>
            {comment.content}
          </p>
        ) : (
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
