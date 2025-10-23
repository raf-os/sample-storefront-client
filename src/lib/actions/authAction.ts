import { jwtDecode } from "jwt-decode";

import GlobalConfig from "@/lib/globalConfig";
import { requestToJson } from "@/lib/utils";

import type { StandardJsonResponse } from "@/types/StandardJsonResponse";

export type TJwtToken = {
    sub: string,
    unique_name: string,
    jti: string,
    role: string,
    exp: number,
    [key: string]: unknown
}

export async function AuthRefresh(): Promise<TJwtToken | null> {
    try {
        const res = await fetch(GlobalConfig.ServerAuthEndpoint + "/refresh", {
            method: "POST",
            credentials: "include"
        });

        if (!res.ok) {
            return null;
        }

        const data = await res.json();
        const token = jwtDecode<TJwtToken>(data);

        return token;
    } catch(error) {
        console.log(error);
        return null;
    }
}

export type AuthLoginProps = {
    username: string,
    password: string
}

export async function AuthLogin(props: AuthLoginProps): Promise<StandardJsonResponse<TJwtToken>> {
    const res = await fetch(GlobalConfig.ServerAuthEndpoint + "/login", {
        method: "POST",
        body: JSON.stringify({
            username: props.username,
            password: props.password
        })
    });

    const data = await requestToJson<string | null>(res);

    if (!res.ok) {
        if (res.status >= 500 && res.status <= 599) return { success: false, message: "Unknown server error occurred." }
        else if (res.status === 401) return { success: false, message: "Invalid credentials." }
        return {
            success: false,
        }
    }

    if (!data) { throw new Error("ERROR - Invalid login fetch response.") }

    const token = jwtDecode<TJwtToken>(data);

    return {
        success: true,
        data: token
    }
}

export type AuthRegisterProps = {
    username: string,
    password: string,
    email: string,
}

type RegisterFetchResponse = {
    message?: string
}

export async function AuthRegister(props: AuthRegisterProps): Promise<StandardJsonResponse> {
    const res = await fetch(GlobalConfig.ServerAuthEndpoint + "/login", {
        method: "POST",
        body: JSON.stringify({
            username: props.username,
            password: props.password,
            email: props.email
        })
    });

    const data = await requestToJson<RegisterFetchResponse>(res);

    if (!res.ok) {
        return {
            success: false,
            message: data?.message || "Unknown server error occurred.",
        }
    }

    return {
        success: true,
        message: data?.message,
    }
}