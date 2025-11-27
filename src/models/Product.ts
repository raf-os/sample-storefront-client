import type { TUser } from "./User"
import type { TComment } from "./Comment"
import type { WithRequired } from "@/types/utilities"
import type { TCategoryDTO } from "@/models/Category"

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
    imageIds?: string[],
    metadata: TProductMetadata

    userId: string,
    user?: TUser,

    comments?: TComment[],
    categories?: TCategoryDTO[],
    //productCategories?: TProductCategory[]
}

export type TProductWithCommments = WithRequired<TProduct, 'comments'>;

export type TProductListItem = {
    id: string,
    creationDate: number,
    name: string,
    price: number,
    discount?: number,

    categories?: TCategoryDTO[],
    //productCategories?: TProductCategory[]
}