import GlobalConfig from "@/lib/globalConfig";
import { requestToJson } from "@/lib/utils";

import TokenRefreshHandler from "@/handlers/TokenRefreshHandler";
import AuthSingleton from "@/classes/AuthSingleton";
import * as RESPONSES from "@/lib/jsonResponses";

export type TAddCommentRequest = {
    rating: number,
    content?: string,
}

export async function AddCommentAction(params: TAddCommentRequest, productId: string) {
    const tokenCheck = await TokenRefreshHandler.validateToken();

    if (!tokenCheck) return new RESPONSES.LoginTokenTimeoutError();

    try {
        const token = AuthSingleton.getJwtToken();
        const res = await fetch(GlobalConfig.ServerCommentEndpoint + `/${productId}`, {
            method: "PUT",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });

        const data = await requestToJson(res);

        if (!res.ok) {
            if (res.status === 400) return new RESPONSES.BadRequest({ message: data?.message });
            else if (res.status === 401) return new RESPONSES.UnauthorizedRequest();
            else return new RESPONSES.ServerFetchError();
        }

        return new RESPONSES.Ok();
    } catch(err) {
        console.error(err);
        return new RESPONSES.ServerFetchError();
    }
}