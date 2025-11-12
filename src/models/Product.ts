import type { TUser } from "./User"
import type { TProductCategory } from "./ProductCategory"
import type { TComment } from "./Comment"

export type TProductRating = {
    value?: number,
    amount: number
}

export type TProductMetadata = {
    sales: number
}

export type TProduct = {
    id: string,
    creationDate: number,
    name: string,
    price: number
    discount?: number,
    description?: string,
    rating: TProductRating
    tags?: string[],
    metadata: TProductMetadata

    userId: string,
    user?: TUser,

    comments?: TComment[]
    productCategories?: TProductCategory[]
}

export type TProductListItem = {
    id: string,
    creationDate: number,
    name: string,
    price: number,
    discount?: number,

    productCategories?: TProductCategory[]
}