import type { TUserRoles } from "@/authContext"
import type { TProduct } from "./Product"

export type TUser = {
    id: string,
    name: string,
    role: TUserRoles,
    signupDate: number,
    //comments?: TComment[],
    products?: TProduct
}

export type TPrivateUser = TUser & {
    email: string,
    isVerified: boolean
}