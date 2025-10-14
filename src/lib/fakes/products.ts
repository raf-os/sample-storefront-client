import { v4 as uuid } from "uuid";

export type ProductProps = {
    name: string,
    label: string,
    displayImage?: string,
    imageList?: string[],
    description?: string,
    price: number,
    discount?: number,
}

export class FakeProduct {
    private _internalId: number;
    id: string = uuid();
    name: string;
    label: string;
    description?: string;
    price: number;
    discount?: number;
    private static _staticIdIncrement: number = 1;

    private static _autoIncrement() {
        const currentId = this._staticIdIncrement;
        this._staticIdIncrement += 1;
        return currentId;
    }

    constructor (props: ProductProps) {
        this.name = props.name;
        this.label = props.label;
        this.description = props.description;
        this.price = props.price;
        this.discount = props.discount || 0;

        this._internalId = FakeProduct._autoIncrement();
    }
}

const fakeProductList: FakeProduct[] = [
    new FakeProduct({
        name: "fent",
        label: "Fentanyl",
        price: 2.49
    }),
    new FakeProduct({
        name: "sonic-plusie",
        label: "Sonic (tm) Original (tm) plushie (tm) (tm)",
        price: 99.99,
        discount: 10,
    }),
    new FakeProduct({
        name: "cum-jar",
        label: "Inconspicuous Jar",
        description: "Goes really well with the sonic plushie.",
        price: 14.59,
    }),
    new FakeProduct({
        name: "worthless-sack-of-shit",
        label: "Ape NFT",
        description: "My apes! No! They're all gone! Please, do NOT screenshot this product and send it to your friends free of charge!",
        price: 0.01,
    }),
    new FakeProduct({
        name: "scam-phone",
        label: "Apple iPhone",
        description: "You will own nothing. Everything is a subscription. You may not tinker with the products you receive, for your own safety. Do not trust your own eyes and ears. You will eat the bugs. You will live in the pods.",
        price: 1999.99,
        discount: 25,
    }),
    new FakeProduct({
        name: "actual-currency",
        label: "Money",
        description: "Money's on sale.",
        price: 124.49,
        discount: 15
    })
];

export default fakeProductList;