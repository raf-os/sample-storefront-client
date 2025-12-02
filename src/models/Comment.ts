import type { TUser } from "./User"
import type { TProduct } from "./Product"
import type { WithRequired } from "@/types/utilities"

export type TComment = {
    id: string,
    postDate: number,
    content?: string,
    score: number,

    productId: string,
    product?: TProduct

    userId: string,
    user?: TUser
}

export type TCommentPayload = {
    comments: WithRequired<TComment, 'user'>[],
    isEndOfList: boolean,
    hasCommented: boolean
}