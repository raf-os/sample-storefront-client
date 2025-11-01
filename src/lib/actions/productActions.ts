import { requestToJson } from "@/lib/utils";
import TokenRefreshHandler from "@/handlers/TokenRefreshHandler";
import GlobalConfig from "@/lib/globalConfig";
import type { StandardJsonResponse } from "@/types/StandardJsonResponse";

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
        const res = await fetch(GlobalConfig.ServerProductEntpoint, {
            method: "PUT",
            credentials: "include",
            body: JSON.stringify(request)
        })

        const data = await requestToJson<{ id: string }>(res);

        if (!res.ok) {
            if (res.status===400) return { success: false, message: "Bad fetch request." }
            else if (res.status===401) return { success: false, message: "You're not authorized for this action." }
            else return { success: false }
        }

        return { success: true, data: data?.id }
    } catch(err) {
        console.error(err);
        return {
            success: false,
            message: "Error contacting server."
        }
    } 
}