export default class CustomResponseError<T> extends Error {
    readonly code: number;
    readonly data?: T;

    constructor(code: number, message?: string, data?: T) {
        super(message ?? "Unknown error occurred.");
        this.name = "FetchResponseError";
        this.code = code;
        if (data !== undefined) this.data = data;
    }
}