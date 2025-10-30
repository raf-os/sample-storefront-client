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
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) {
            return null;
        }

        const data = await res.text();
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
    try {
        const res = await fetch(GlobalConfig.ServerAuthEndpoint + "/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                username: props.username,
                password: props.password
            })
        });

        const data = await res.text();

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
    } catch(err) {
        console.log(err);
        return {
            success: false,
            message: "Error contacting server."
        }
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
    try {
        const res = await fetch(GlobalConfig.ServerAuthEndpoint + "/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: props.username,
                password: props.password,
                email: props.email
            })
        });

        const data = await requestToJson<RegisterFetchResponse>(res);

        console.log(data)

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
    } catch(err) {
        console.log("Server error: ", err);

        return {
            success: false,
            message: "Error connecting to server."
        };
    }
}

export async function AuthLogout(): Promise<StandardJsonResponse> {
    try {
        const res = await fetch(GlobalConfig.ServerAuthEndpoint+ "/logout", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        if (!res.ok) {
            return {
                success: false,
                message: "Error logging out. Wait, how is this possible?"
            }
        }

        return { success: true }
    } catch (err) {
        console.log(err);

        return {
            success: false,
            message: "Error contacting server."
        }
    }
}