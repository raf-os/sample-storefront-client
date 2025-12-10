import type z from "zod";
import { serverRequest } from "@/lib/serverRequest";
import { UserAccountForm } from "@/models/schemas";

export async function GetUserPageById(uid: string) {
    const data = await serverRequest("get", "/api/User/{Id}", {
        params: {
            path: { Id: uid }
        }
    });

    return data;
}

export async function GetUserPrivateData() {
    const data = await serverRequest("get", "/api/User/my-data", {}, { useAuth: true });
    return data;
}

export async function UpdateAccountDetails(data: z.infer<typeof UserAccountForm>) {
    const parsed = await UserAccountForm.parseAsync(data);
    for (const [k, v] of Object.entries(parsed)) {
        if (v === undefined || v === "") {
            delete parsed[k as keyof typeof parsed];
        }
    }
    await serverRequest("post", "/api/User/update-profile", { body: parsed }, { useAuth: true });
    return;
}