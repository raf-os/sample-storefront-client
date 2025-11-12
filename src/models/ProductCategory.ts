import type { TCategory } from "./Category"
import type { TProduct } from "./Product"

export type TProductCategory = {
    productId: string,
    categoryId: string,
    product?: TProduct,
    category?: TCategory
}