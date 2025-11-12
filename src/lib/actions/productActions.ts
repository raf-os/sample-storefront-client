import { requestToJson } from "@/lib/utils";
import TokenRefreshHandler from "@/handlers/TokenRefreshHandler";
import GlobalConfig from "@/lib/globalConfig";
import type { StandardJsonResponse } from "@/types/StandardJsonResponse";
import type { TProduct, TProductListItem } from "@/models";

import * as RESPONSES from "@/lib/jsonResponses";

type AddProductRequest = {
    name: string,
    price: number,
    description?: string
}

export async function AddProductAction(request: AddProductRequest): Promise<StandardJsonResponse<string>> {
    const tokenCheck = await TokenRefreshHandler.validateToken();

    if (!tokenCheck) {
        return {
            success: false,
        }
    }

    try {
        const res = await fetch(GlobalConfig.ServerProductEndpoint, {
            method: "PUT",
            credentials: "include",
            body: JSON.stringify(request)
        })

        const data = await requestToJson<{ id: string }>(res);

        if (!res.ok) {
            if (res.status===400) return { success: false, message: "Bad fetch request." }
            else if (res.status===401) return new RESPONSES.UnauthorizedRequest();
            else return { success: false }
        }

        return { success: true, data: data?.id }
    } catch(err) {
        console.error(err);
        return new RESPONSES.ServerFetchError();
    } 
}

export async function GetProductById(id: string) {
    try {
        const res = await fetch(GlobalConfig.ServerProductEndpoint + `/item/${id}`);

        if (!res.ok) {
            return new RESPONSES.NotFound();
        }

        const data = await requestToJson<TProduct>(res);

        if (!data) return new RESPONSES.NotFound();

        return new RESPONSES.Ok<TProduct>({ data });
    } catch(err) {
        console.error(err);
        return new RESPONSES.ServerFetchError();
    }
}

export type TProductListPageResponse = {
    items: TProductListItem[],
    totalPages: number
}

export async function GetProductListPage(params?: { category?: string, offset?: number }): Promise<StandardJsonResponse<TProductListPageResponse>> {
    try {
        const urlParams = new URLSearchParams();
        if (params?.category) urlParams.set("category", params.category);
        if (params?.offset) urlParams.set("category", String(params.offset));

        const res = await fetch(GlobalConfig.ServerProductEndpoint + "/page/" + urlParams);

        if (!res.ok) {
            return new RESPONSES.BadRequest();
        }

        const data = await requestToJson<TProductListPageResponse>(res);

        if (!data) return new RESPONSES.ServerFetchError();

        return new RESPONSES.Ok<TProductListPageResponse>({ data });
    } catch(err) {
        console.error(err);
        return new RESPONSES.ServerFetchError();
    }
}