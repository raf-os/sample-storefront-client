import GlobalConfig from "@/lib/globalConfig";
import createClient, { type Middleware, type MaybeOptionalInit, type ClientRequestMethod, type Client, createFinalURL, createQuerySerializer, type ParamsOption, type HeadersOptions } from "openapi-fetch";
import type { MediaType, HttpMethod, PathsWithMethod, RequiredKeysOf, RequestBodyJSON, OperationRequestBody, ResponseObjectMap, SuccessResponse, ErrorResponse, SuccessResponseJSON, ErrorResponseJSON } from "openapi-typescript-helpers";
import type { paths } from "@/api/schema";
import { QueryClient, type QueryFunctionContext } from "@tanstack/react-query";

import TokenRefreshHandler from "@/handlers/TokenRefreshHandler";
import AuthSingleton from "@/classes/AuthSingleton";

type RequestBody<Path extends keyof paths, Method extends keyof paths[Path]> = 
    paths[Path][Method] extends { requestBody: { content: { 'application/json': infer B } } } ? B : never;

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
        }
    }
});

const authMiddleware: Middleware = {
    async onRequest({ request }) {
        const tokenCheck = await TokenRefreshHandler.validateToken();

        if (!tokenCheck) {
            throw new Error("You're unauthorized for this request.");
        }

        const token = AuthSingleton.getJwtToken();

        request.headers.set("Authorization", `Bearer ${token}`);
        return request;
    }
}

const queryMiddleware: Middleware = {
    async onRequest({ request, params }) {
        const data = await queryClient.fetchQuery({
            queryKey: [ request.method, params.path, params.query ],
        });
    }
}

const client = createClient<paths>({ baseUrl: GlobalConfig.ServerAddr });
const authClient = createClient<paths>({ baseUrl: GlobalConfig.ServerAddr });
authClient.use(authMiddleware);

function replacePath(path: string, params?: Record<string, string | number>): string {
    if (!params) return path;
    
    let result = path;
    for (const [key, value] of Object.entries(params)) {
        result = result.replace(`{${key}}`, encodeURIComponent(String(value)));
    }
    return result;
}

function serializeQuery(params?: Record<string, any>): string {
    if (!params) return '';
    
    const searchParams = new URLSearchParams();
    
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) continue;
        
        if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)));
        } else if (typeof value === 'object') {
        searchParams.append(key, JSON.stringify(value));
        } else {
        searchParams.append(key, String(value));
        }
    }
    
    const query = searchParams.toString();
    return query ? `?${query}` : '';
}

type PathParams<Path extends keyof paths, Method extends keyof paths[Path]> = 
    paths[Path][Method] extends { parameters: { path: infer P } } ? P : never;

type QueryParams<Path extends keyof paths, Method extends keyof paths[Path]> = 
    paths[Path][Method] extends { parameters: { query: infer Q } } ? Q : never;

type ResponseBody<Path extends keyof paths, Method extends keyof paths[Path]> = 
    paths[Path][Method] extends { responses: { 200: { content: { 'application/json': infer R } } } } ? R : unknown;

export async function serverRequest<
    Method extends HttpMethod,
    Path extends PathsWithMethod<paths, Method>
>(
    method: Method,
    path: Path,
    options?: {
        params?: {
            path?: PathParams<Path, Method>,
            query?: QueryParams<Path, Method>
        },
        body?: OperationRequestBody<paths[Path][Method]>,
        headers?: HeadersInit
    }
): Promise<SuccessResponseJSON<paths[Path][Method] & Record<string | number, any>>> {
    const baseUrl = GlobalConfig.ServerAddr;

    let url = replacePath(String(path), options?.params?.path as any);
    url += serializeQuery(options?.params?.query as any);

    const headers = { ...options?.headers };

    const fetchOptions: RequestInit = {
        method: String(method).toUpperCase(),
        headers
    }

    if (options?.body && ['POST', 'PUT', 'PATCH'].includes(String(method).toUpperCase())) {
        fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(`${baseUrl}${url}`, fetchOptions);

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
        return response.json();
    }

    return response.json();
}

export {
    client,
    authClient
}