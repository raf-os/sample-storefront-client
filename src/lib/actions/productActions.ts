import { z } from "zod";

import { requestToJson } from "@/lib/utils";
import TokenRefreshHandler from "@/handlers/TokenRefreshHandler";
import GlobalConfig from "@/lib/globalConfig";
import type { StandardJsonResponse } from "@/types/StandardJsonResponse";
import type { TComment, TProduct, TProductListItem } from "@/models";

import AuthSingleton from "@/classes/AuthSingleton";
import * as RESPONSES from "@/lib/jsonResponses";
import type { WithRequired } from "@/types/utilities";

type AddProductRequest = {
    name: string,
    price: number,
    description?: string,
    categories?: number[]
}

export async function AddProductAction(request: AddProductRequest): Promise<StandardJsonResponse<string>> {
    const tokenCheck = await TokenRefreshHandler.validateToken();

    if (!tokenCheck) {
        return {
            success: false,
        }
    }

    try {
        const token = AuthSingleton.getJwtToken();
        const res = await fetch(GlobalConfig.ServerProductEndpoint, {
            method: "PUT",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
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
    items: {
        product: TProductListItem,
        commentCount: number
    }[],
    totalPages: number
}

export const FetchProductListSchema = z.object({
    category: z.string().optional(),
    offset: z.int().transform(n => String(n)).optional(),
    userId: z.guid().optional()
}).optional();

export type TFetchProductListParams = z.input<typeof FetchProductListSchema>;

export async function GetProductListPage(params: TFetchProductListParams): Promise<StandardJsonResponse<TProductListPageResponse>> {
    try {
        const parsed = await z.parseAsync(FetchProductListSchema, params);

        const urlParams = new URLSearchParams();
        if (parsed !== undefined) {
            for (const [k, v] of Object.entries(parsed)) {
                if (v !== undefined && v !== null) {
                    urlParams.append(k, v);
                }
            }
        }

        const res = await fetch(GlobalConfig.ServerProductEndpoint + "/page" + (urlParams ? `?${urlParams}` : ""));

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

export async function GetProductComments(productId: string, offset?: number) {
    try {
        const urlParams = new URLSearchParams();
        if (offset !== undefined) {
            urlParams.append('offset', String(offset));
        }
        const res = await fetch(GlobalConfig.ServerProductEndpoint + `/item/${productId}/comments` + (offset !== undefined ? `?${urlParams}` : ""));

        if (!res.ok)
            return new RESPONSES.BadRequest();

        const data = await requestToJson<WithRequired<TComment, 'user'>[]>(res);

        if (!data) return new RESPONSES.ServerFetchError();

        return new RESPONSES.Ok<typeof data>({ data });
    } catch(err) {
        console.error(err);
        return new RESPONSES.ServerFetchError();
    }
}