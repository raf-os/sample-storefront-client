import type z from "zod";
import { serverCachedRequest, serverRequest } from "@/lib/serverRequest";
import { UserAccountForm } from "@/models/schemas";
// import { QueryKeys } from "../queryKeys";

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
  const data = await serverCachedRequest("get", "/api/User/cart/size", {}, { useAuth: true });
  return data;
}

export async function GetUserCartPreview() {
  const data = await serverRequest("get", "/api/User/cart", { query: { isPreview: true } }, { useAuth: true });
  return data;
}

export async function GetUserCart(offset?: number) {
  const data = await serverCachedRequest("get", "/api/User/cart", { query: { offset: offset } }, { useAuth: true, staleTime: 1 * 1000 });
  return data;
}

export async function ClearUserCart() {
  const deletedAmount = await serverRequest("delete", "/api/User/cart/clear", {}, { useAuth: true });
  console.info(`Removed ${deletedAmount} items from cart`);
  return deletedAmount;
}

export async function GetUserInboxSize(
  opts?: {
    unreadOnly?: boolean
  }
) {
  const data = await serverCachedRequest("get", "/api/Mail/inbox/size", {
    query: { unreadOnly: opts?.unreadOnly ?? false }
  }, { useAuth: true });
  return data;
}

export async function GetUserInboxPreview() {
  const data = await serverRequest("get", "/api/Mail/inbox/preview", {}, { useAuth: true });
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
