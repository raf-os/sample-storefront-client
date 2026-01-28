import { createFileRoute, Link } from '@tanstack/react-router';
import { useServerAction } from "@/hooks";
import PageSetup from "@/components/layout/PageSetup";
import { cn, roleToString } from "@/lib/utils";
import { useEffect, useState } from "react";

import { GetUserPageById } from "@/lib/actions/userAction";

import type { paths } from "@/api/schema";
import UserAvatar from "@/components/common/UserAvatar";
import type { Flatten } from "@/types/utilities";
import { Star } from "lucide-react";
import ImagePromise from "@/components/common/ImagePromise";
import { ServerImagePath } from "@/lib/serverRequest";

import {
  CameraOff as ThumbnailNotFoundIcon
} from "lucide-react";

export const Route = createFileRoute('/user/$userId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PageSetup mainContent={MainContent} />
}

type UserDataAlias = paths['/api/User/{Id}']['get']['responses']['200']['content']['application/json'];
type UserCommentsAlias = UserDataAlias['comments'];
type UserProductsAlias = UserDataAlias['products'];

function MainContent() {
  const { userId } = Route.useParams();
  const [loadedData, setLoadedData] = useState<UserDataAlias | null>(null);
  const [isPending, startTransition, errorMessage] = useServerAction();

  const signupDate = loadedData?.signupDate ? new Date(loadedData.signupDate).toLocaleDateString() : null;
  const roleName = loadedData ? roleToString(loadedData?.role) : "(loading...)";

  useEffect(() => {
    startTransition(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      const data = await GetUserPageById(userId);
      // console.log(data);

      setLoadedData(data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (errorMessage !== null) {
    return (
      <LayoutBlock className="grow-0 shrink-0">
        <h1>
          Error
        </h1>

        <p>
          User not found.
        </p>
      </LayoutBlock>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex gap-2 items-start">
        <div className="flex flex-col gap-4 grow-1 shrink-1">
          <LatestProducts
            products={loadedData?.products}
          />
          <LatestComments
            comments={loadedData?.comments}
          />
        </div>

        <LayoutBlock
          className="flex flex-col gap-2 grow-0 shrink-0 p-4"
        >
          <UserAvatar userId={loadedData?.id} size={256} />

          {loadedData ? (
            <div>
              <h1 className="font-bold text-lg">
                {loadedData.name}
              </h1>

              <div>
                <h2 className="text-sm opacity-75">Member since</h2>
                <p>{signupDate}</p>
              </div>

              <div>
                <h2 className="text-sm opacity-75">Account type</h2>
                <p>{roleName}</p>
              </div>

              <div>
                <Link to="/app/user/inbox/compose" search={{ to: loadedData.id }}>
                  Send a private message
                </Link>
              </div>
            </div>
          ) : (
            <p>Loading profile...</p>
          )}
        </LayoutBlock>
      </div>
    </div>
  )
}

function LatestProducts({ products }: { products: UserProductsAlias }) {
  function ProductPlaceholder() {
    return (
      <>
        {[...Array(5)].map((_, idx) => (
          <li className="grow-1 shrink-1 aspect-square rounded-box bg-base-300 animate-pulse" key={idx} />
        ))}
      </>
    )
  }

  function ProductItemCard({ product }: { product: Flatten<Exclude<UserProductsAlias, null | undefined>> }) {
    return (
      <Link
        to="/item/$itemId"
        params={{ itemId: product.id as string }}
        className="outline-none group"
      >
        <li
          className="flex flex-col rounded-box overflow-hidden bg-base-200 border border-base-300 shadow-xs group-focus:ring-4 ring-base-500 transition-shadow"
        >

          <div className="aspect-square border-b border-b-base-300">
            {(product.imageIds && product.imageIds.length !== 0) ?
              (<ImagePromise
                src={ServerImagePath(
                  "/api/Product/thumbnail/{thumbId}",
                  {
                    path:
                      { thumbId: product.imageIds[0] }
                  }
                )}
              />) : (
                <div
                  className="flex items-center justify-center size-full"
                >
                  <ThumbnailNotFoundIcon className="size-1/2 min-w-12 min-h-12 stroke-base-400" />
                </div>
              )
            }
          </div>

          <h2 className="font-medium text-primary-300 line-clamp-2 overflow-ellipsis whitespace-nowrap px-2 py-1">
            {product.name}
          </h2>
        </li>
      </Link>
    )
  }

  return (
    <LayoutBlock className="p-4">
      <h1 className="text-lg font-bold leading-none mb-4">
        Latest products
      </h1>

      <ul className="grid grid-cols-5 gap-4">
        {(products === null || products === undefined)
          ? <ProductPlaceholder />
          : (
            <>
              {products.map(product => (
                <ProductItemCard
                  product={product}
                  key={product.id}
                />
              ))}
            </>
          )
        }
      </ul>
    </LayoutBlock>
  )
}

function LatestComments({ comments }: { comments: UserCommentsAlias }) {
  return (
    <LayoutBlock className="p-4">
      <h1 className="text-lg font-bold leading-none mb-4">
        Latest reviews
      </h1>

      <ul className="flex flex-col gap-4">
        {(comments === undefined || comments === null)
          ? (
            <>
              {[...Array(5)].map((_, idx) => (
                <li className="grow-1 shrink-1 h-24 rounded-box shimmer" key={idx} />
              ))}
            </>
          )
          : (
            <>
              {comments.length === 0
                ? (
                  <p>No comments found.</p>
                )
                : (
                  <>
                    {comments.map(comment => (
                      <UserCommentItem
                        key={comment.id}
                        comment={comment}
                      />
                    ))}
                  </>
                )
              }
            </>
          )
        }
      </ul>
    </LayoutBlock>
  )
}

function UserCommentItem({ comment }: { comment: Flatten<Exclude<UserCommentsAlias, null | undefined>> }) {
  return (
    <li
      className="flex flex-col gap-2 grow-1 shrink-1 border border-base-300 p-2 shadow-xs rounded-box"
    >
      <div>
        <h2 className="font-medium text-primary-300 truncate grow-0 shrink-1 mb-1">
          <Link to="/item/$itemId" params={{ itemId: comment.productId as string }} className="outline-none focus:underline">
            {comment.productName}
          </Link>
        </h2>

        <div className="inline-flex grow-0 shrink-0 p-0.5 border border-base-300 rounded-box shadow-xs">
          {[...Array(5)].map((_, idx) => (
            <Star
              key={idx}
              className={cn(
                "size-5 stroke-0",
                idx >= (comment.score ?? 0)
                  ? "fill-base-400"
                  : "fill-amber-400"
              )}
            />
          ))}
        </div>
      </div>

      <div className="bg-base-100 rounded-box px-2 py-1 line-clamp-3">
        {comment.content
          ? (
            comment.content
          )
          : (
            <p className="opacity-50">(no comment)</p>
          )
        }
      </div>
    </li>
  )
}

function LayoutBlock({ children, className, ...rest }: React.ComponentPropsWithRef<'div'>) {
  return (
    <div
      className={cn(
        "grow-1 shrink-1 bg-base-200 border border-base-300/75 shadow-xs text-base-500 rounded-box px-4 py-3",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
