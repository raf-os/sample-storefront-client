import { useState, useEffect } from "react";
import { AuthContext, type IAuthContext, type TAuthData } from "@/authContext";
import { AuthLogin, AuthRefresh, AuthRegister, type TJwtToken } from "@/lib/actions/authAction";

import TokenRefreshHandler from "@/handlers/TokenRefreshHandler";

export function AuthWrapper({ children }: { children?: React.ReactNode }) {
    const [ authData, setAuthData ] = useState<TAuthData | null>(null);

    const _updateAuth = (token?: TJwtToken | null) => {
        if (token === undefined || token === null) {
            setAuthData(null);
            TokenRefreshHandler.updateExpireDate(0);
        } else {
            setAuthData({
                userName: token.unique_name,
                userId: token.sub,
                exp: token.exp * 1000,
                role: token.role
            });
            TokenRefreshHandler.updateExpireDate(token.exp * 1000);
        }
    }

    const login = async (username: string, password: string) => {
        const res = await AuthLogin({ username, password });

        if (res.success) {
            _updateAuth(res.data);
        }

        return res;
    }

    const register = async (username: string, password: string, email: string) => {
        const res = await AuthRegister({ username, password, email });

        return res;
    }

    useEffect(() => {
        const fetchAuth = async () => {
            const token = await AuthRefresh();
            _updateAuth(token);
        }

        fetchAuth();
    }, []);

    useEffect(() => {
        const onTokenRefresh = (newToken: TJwtToken | null) => {
            _updateAuth(newToken);
        }

        return TokenRefreshHandler.Observable.subscribe("onTokenRefreshed", onTokenRefresh);
    }, []);

    const ctx: IAuthContext = {
        authData,
        login,
        register
    };

    return (
        <AuthContext.Provider value={ctx}>
            { children }
        </AuthContext.Provider>
    )
}