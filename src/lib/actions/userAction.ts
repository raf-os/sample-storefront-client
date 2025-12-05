import { authClient } from "@/lib/serverRequest";

export async function GetUserPageById(uid: string) {
    const { data, error } = await authClient.GET("/User/{Id}", {
        params: {
            path: { Id: uid }
        }
    });

    return data;
}