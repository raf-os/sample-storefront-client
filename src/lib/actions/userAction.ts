import { authClient, serverRequest } from "@/lib/serverRequest";

export async function GetUserPageById(uid: string) {
    const data = await serverRequest("get", "/User/{Id}", {
        params: {
            path: { Id: uid }
        }
    });

    return data;
}