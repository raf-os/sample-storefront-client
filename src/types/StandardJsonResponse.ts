export type StandardJsonResponse<T = unknown> = {
    success: boolean,
    message?: string,
    data?: T
}