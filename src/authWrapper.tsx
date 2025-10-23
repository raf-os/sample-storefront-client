import { useState, useEffect } from "react";
import { AuthContext, DefaultAuthContext, type IAuthContext, type TAuthData } from "@/authContext";
import { AuthLogin, AuthRefresh, AuthRegister, type TJwtToken } from "@/lib/actions/authAction";

export function AuthWrapper({ children }: { children?: React.ReactNode }) {
    const [ authData, setAuthData ] = useState<TAuthData | undefined>(undefined);

    const _updateAuth = (token?: TJwtToken) => {
        if (token === undefined) {
            setAuthData(undefined);
        } else {
            setAuthData({
                userName: token.unique_name,
                userId: token.sub,
                exp: token.exp,
                role: token.role
            });
        }
    }

    const logIn = async (username: string, password: string) => {
        const res = await AuthLogin({ username, password });

        if (res.success) {
            _updateAuth(res.data);
            return true;
        } else {
            return false;
        }
    }

    const register = async (username: string, password: string, email: string) => {
        const res = await AuthRegister({ username, password, email });
    }

    useEffect(() => {
        const fetchAuthData = async () => {
            const authData = await AuthRefresh();

            if (authData) {
                setAuthData({
                    userId: authData.sub,
                    userName: authData.unique_name,
                    exp: authData.exp * 1000,
                    role: authData.role
                });
            }
        }

        fetchAuthData();
    });

    const ctx: IAuthContext = {
        authData,
        _updateAuth
    };

    return (
        <AuthContext.Provider value={ctx}>
            { children }
        </AuthContext.Provider>
    )
}