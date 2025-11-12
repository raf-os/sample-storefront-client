export type StandardJsonResponse<T> = {
    success: boolean,
    message?: string,
    data?: T
}