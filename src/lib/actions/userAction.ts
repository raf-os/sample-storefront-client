import { serverRequest } from "@/lib/serverRequest";

export async function GetUserPageById(uid: string) {
    const data = await serverRequest("get", "/User/{Id}", {
        params: {
            path: { Id: uid }
        }
    });

    return data;
}

export async function GetUserPrivateData() {
    const data = await serverRequest("get", "/User/my-data", {}, { useAuth: true });
    return data;
}