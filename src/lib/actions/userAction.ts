import type z from "zod";
import { serverCachedRequest, serverRequest } from "@/lib/serverRequest";
import { UserAccountForm } from "@/models/schemas";

export async function GetUserPageById(uid: string) {
    const data = await serverRequest("get", "/api/User/{Id}", {
        path: { Id: uid },
        query: {
            comments: true,
            products: true
        }
    });

    return data;
}

export async function GetUserPrivateData() {
    const data = await serverRequest("get", "/api/User/my-data", {}, { useAuth: true });
    return data;
}

export async function GetUserCartSize() {
    const data = await serverRequest("get", "/api/User/cart/size", {}, { useAuth: true });
    return data;
}

export async function GetUserCartPreview() {
    const data = await serverRequest("get", "/api/User/cart", { query: { isPreview: true } }, { useAuth: true });
    return data;
}

export async function GetUserCart(offset?: number) {
    const data = await serverRequest("get", "/api/User/cart", { query: { offset: offset } }, { useAuth: true });
    return data;
}

export async function AddProductToCart(productId: string, amount?: string | number) {
    const amt = amount === undefined ? undefined : Number(amount);

    const data = await serverRequest("put", "/api/User/cart", { body: { productId: productId, amount: amt } }, { useAuth: true });
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

export async function UploadImageAvatar(file: File) {
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        throw new Error("Invalid file type.");
    }
    const formData = new FormData();
    formData.append("image", file);
    await serverRequest("post", "/api/User/profile-pic", { body: formData }, { useAuth: true });
    return;
}