import type { TUser } from "./User"
import type { TProduct } from "./Product"

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