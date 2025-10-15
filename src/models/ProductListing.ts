export type ProductListingProps = {
    id: string,
    name: string,
    price: number,
    discount?: number,
    priceFallback?: [ number, number ],
    description?: string,
    rating?: number,
    comments?: number,
}

export class ProductListing {
    data: ProductListingProps;

    constructor(props: ProductListingProps) {
        this.data = props;
    }
}