import type { StandardJsonResponse } from "@/types/StandardJsonResponse";

export class JsonResponse<T = undefined> {
    readonly success: boolean;
    readonly message?: string | undefined;
    readonly data: T extends undefined ? undefined : T;

    constructor(params: { success: boolean, message?: string });
    constructor(params: { success: boolean, message?: string, data: T });
    constructor(params: StandardJsonResponse<T>) {
        this.success = params.success;
        this.message = params.message;
        this.data = params.data as any;
    }
}

export class ServerFetchError extends JsonResponse {
    constructor() {
        super({
            success: false,
            message: "Error contacting server."
        });
    }
}

export class LoginTokenTimeoutError extends JsonResponse {
    constructor() {
        super({
            success: false,
            message: "Login token is outdated. Re-login and try again."
        });
    }
}

export class UnauthorizedRequest extends JsonResponse {
    constructor() {
        super({
            success: false,
            message: "You are unauthorized for this action."
        });
    }
}

export class BadRequest extends JsonResponse {
    constructor(data?: { message?: string }) {
        super({
            success: false,
            message: data?.message || "Bad server request."
        });
    }
}

export class NotFound extends JsonResponse {
    constructor(message?: string) {
        super({
            success: false,
            message: message ?? "Resource not found."
        });
    }
}

export class Ok<T = undefined> extends JsonResponse<T> {
    constructor(params?: T extends undefined ? { message?: string } : { message?: string; data: T }) {
        super({
            success: true,
            message: params?.message,
            data: (params as any)?.data,
        });
    }
}