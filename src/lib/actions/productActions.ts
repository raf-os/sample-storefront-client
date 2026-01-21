import { z } from "zod";

import { requestToJson, toFormData } from "@/lib/utils";
import TokenRefreshHandler from "@/handlers/TokenRefreshHandler";
import GlobalConfig from "@/lib/globalConfig";
import type { StandardJsonResponse } from "@/types/StandardJsonResponse";

import AuthSingleton from "@/classes/AuthSingleton";
import * as RESPONSES from "@/lib/jsonResponses";
import { ProductPatchSchema, NewProductSchema } from "@/models/schemas";
import { PatchBuilder } from "@/lib/patchBuilder";
import type { TCommentPayload } from "@/models/Comment";
import type { paths } from "@/api/schema";

export async function AddProductAction(request: z.input<typeof NewProductSchema>): Promise<StandardJsonResponse<string>> {
    const tokenCheck = await TokenRefreshHandler.validateToken();

    if (!tokenCheck) {
        return {
            success: false,
        }
    }

    const validated = await NewProductSchema.parseAsync(request);
    //console.log(validated);

    const formData = toFormData(validated);
    //console.log(formData);

    try {
        const token = AuthSingleton.getJwtToken();
        const res = await fetch(GlobalConfig.ServerProductEndpoint, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                //'Content-Type': 'application/json'
            },
            body: formData
        })

        const data = await requestToJson<{ id: string }>(res);

        if (!res.ok) {
            if (res.status === 400) return new RESPONSES.BadRequest();
            else if (res.status === 401) return new RESPONSES.UnauthorizedRequest();
            else return { success: false }
        }

        return { success: true, data: data?.id }
    } catch (err) {
        console.error(err);
        return new RESPONSES.ServerFetchError();
    }
}

export async function GetProductById(id: string) {
    try {
        await TokenRefreshHandler.validateToken();
        const token = AuthSingleton.getJwtToken();

        const res = await fetch(GlobalConfig.ServerProductEndpoint + `/item/${id}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
        });

        if (!res.ok) {
            return new RESPONSES.NotFound();
        }

        const data = await requestToJson<paths['/api/Product/item/{id}']['get']['responses']['200']['content']['application/json']>(res);

        if (!data) return new RESPONSES.NotFound();

        return new RESPONSES.Ok<typeof data>({ data });
    } catch (err) {
        console.error(err);
        return new RESPONSES.ServerFetchError();
    }
}

export type TProductListPageResponse = paths['/api/Product/page']['get']['responses']['200']['content']['application/json'];

export const FetchProductListSchema = z.object({
    category: z.string().optional(),
    offset: z.int().transform(n => String(n)).optional(),
    userId: z.guid().optional()
}).optional();

export type TFetchProductListParams = z.input<typeof FetchProductListSchema>;

export async function GetProductListPage(params: TFetchProductListParams = {}): Promise<StandardJsonResponse<TProductListPageResponse>> {
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
    } catch (err) {
        console.error(err);
        return new RESPONSES.ServerFetchError();
    }
}

export async function GetProductComments(productId: string, lastId?: string, lastDate?: number) {
    try {
        await TokenRefreshHandler.validateToken();
        const token = AuthSingleton.getJwtToken();
        const urlParams = new URLSearchParams();
        if (lastId !== undefined && lastDate !== undefined) {
            urlParams.append('lastId', lastId);
            urlParams.append('lastDate', String(lastDate));
        }
        const res = await fetch(GlobalConfig.ServerCommentEndpoint + `/${productId}` + (urlParams.size !== 0 ? `?${urlParams}` : ""), {
            method: "GET",
            headers: token ? {
                'Authorization': `Bearer ${token}`,
            } : undefined,
        });

        if (!res.ok)
            return new RESPONSES.BadRequest();

        const data = await requestToJson<TCommentPayload>(res);

        if (!data) return new RESPONSES.ServerFetchError();

        return new RESPONSES.Ok<typeof data>({ data });
    } catch (err) {
        console.error(err);
        return new RESPONSES.ServerFetchError();
    }
}

/** TODO: This */
export async function PatchDocumentById(
    productId: string,
    patchProps: z.input<typeof ProductPatchSchema>,
    successMessages?: string[]
) {

    const tokenCheck = await TokenRefreshHandler.validateToken();
    if (!tokenCheck) return new RESPONSES.UnauthorizedRequest("You're not authorized for this action.");

    const token = AuthSingleton.getJwtToken();

    const data = await ProductPatchSchema.parseAsync(patchProps);
    if (Object.keys(data).length === 0) return new RESPONSES.BadRequest();

    const { files, filesToDelete, ...patchedData } = data;

    const pb = new PatchBuilder<Omit<z.infer<typeof ProductPatchSchema>, "files" | "filesToDelete">>();

    for (const [k, v] of Object.entries(patchedData)) {
        if (v === undefined) {
            pb.remove(`/${k}` as any);
        } else {
            pb.replace(`/${k}` as any, v as any);
        }
    }

    const patch = pb.build();

    if (patch.length !== 0) {
        const res = await fetch(GlobalConfig.ServerProductEndpoint + `/${productId}`, {
            method: "PATCH",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patch),
        });

        if (!res.ok) {
            if (res.status === 400) return new RESPONSES.BadRequest();
            else if (res.status === 401) return new RESPONSES.UnauthorizedRequest();
            else return new RESPONSES.NotFound();
        }

        if (Array.isArray(successMessages))
            successMessages?.push("Fields were updated successfully.");
    }

    if ((filesToDelete && filesToDelete.length !== 0) || (files && files.length !== 0)) {
        const formData = new FormData();
        filesToDelete?.forEach(fileId => formData.append('remove', fileId));
        files?.forEach(file => formData.append('uploads', file));

        const res = await fetch(GlobalConfig.ServerProductEndpoint + `/item/${productId}/image`, {
            method: "PATCH",
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData
        });

        // TODO: Make helper function so I don't have to repeat this every time
        if (!res.ok) {
            if (res.status === 400) return new RESPONSES.BadRequest({ message: "Invalid file update request." });
            else if (res.status === 401) return new RESPONSES.UnauthorizedRequest("You're not authorized to alter this product's attachments.");
            else if (res.status === 404) return new RESPONSES.NotFound("Requested product was not found. This is unexpected, as the previous operation succeeded.");
            else return new RESPONSES.ServerFetchError();
        }

        if (Array.isArray(successMessages))
            successMessages?.push("Images updated successfully.");
    }

    return new RESPONSES.Ok();
}
