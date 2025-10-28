import { useContext } from "react";
import { AuthContext } from "@/authContext";
import GlobalConfig from "@/lib/globalConfig";

export default function useAuth() {
    const { authData } = useContext(AuthContext);

    const checkIsAuthorized = () => {
        if (!authData) return false;

        const dateNow = Date.now();
        if (dateNow > authData.exp) {
            return false;
        }

        return true;
    }

    const isAuthModerator = () => {
        if (!checkIsAuthorized()) return false;

        return (authData?.role === GlobalConfig.UserRoles.Operator || authData?.role === GlobalConfig.UserRoles.Operator);
    }

    const isAuthAdmin = () => {
        if (!checkIsAuthorized()) return false;

        return (authData?.role === GlobalConfig.UserRoles.Operator || authData?.role === GlobalConfig.UserRoles.Operator);
    }

    return {
        checkIsAuthorized,
        isAuthModerator,
        isAuthAdmin,
        authData
    }
}