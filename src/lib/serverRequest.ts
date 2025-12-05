import GlobalConfig from "@/lib/globalConfig";
import createClient, { type Middleware, type MaybeOptionalInit, type ClientRequestMethod, type Client, createFinalURL, createQuerySerializer, type ParamsOption } from "openapi-fetch";
import type { MediaType, HttpMethod, PathsWithMethod, RequiredKeysOf } from "openapi-typescript-helpers";
import type { paths } from "@/api/schema";
import { QueryClient, type QueryFunctionContext } from "@tanstack/react-query";

import TokenRefreshHandler from "@/handlers/TokenRefreshHandler";
import AuthSingleton from "@/classes/AuthSingleton";

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
        // fuck
    }
}

const client = createClient<paths>({ baseUrl: GlobalConfig.ServerAddr });
const authClient = createClient<paths>({ baseUrl: GlobalConfig.ServerAddr});
authClient.use(authMiddleware);

const querySerializer = createQuerySerializer();

type InitParam<Init> = RequiredKeysOf<Init> extends never
  ? [(Init & { [key: string]: unknown })?]
  : [Init & { [key: string]: unknown }];

function serverRequest<T extends HttpMethod, Path extends PathsWithMethod<paths, T>>(method: T, path: Path, params: Path) {
    const url = createFinalURL(path, { baseUrl: `${GlobalConfig.ServerAddr}/`, params, querySerializer });
};

export {
    client,
    authClient
}