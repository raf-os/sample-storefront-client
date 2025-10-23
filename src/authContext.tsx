import { createContext } from "react";

import type { TJwtToken } from "@/lib/actions/authAction";

export type TUserRoles = "User" | "Operator" | "Admin";

export type TAuthData = {
    userName: string,
    userId: string,
    exp: number,
    role: TUserRoles | string
}

export interface IAuthContext {
    _updateAuth: (token: TJwtToken) => void,
    authData?: TAuthData,
}

export const DefaultAuthContext: IAuthContext = {
    _updateAuth: () => {}
}

export const AuthContext = createContext<IAuthContext>(DefaultAuthContext);