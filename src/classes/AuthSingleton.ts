import type { TJwtToken } from "@/lib/actions/authAction";

// Poor man's enum
const AuthMap: Record<string, number> = {
    "Guest": 0, // this should probably never happen
    "User": 1 << 0,
    "Operator": 1 << 1,
    "Administrator": 1 << 2,
}

function MapAuthRole(role: string) {
    if (Object.hasOwn(AuthMap, role)) {
        return AuthMap[role];
    } else {
        return AuthMap["Guest"]; // Just in case...
    }
}

type TAuthData = {
    name: string,
    id: string,
    exp: number,
    role: number,
}

/** Simply a helper, in case this needs to be accessed from outside a react context. */
class _AuthSingleton {
    private data: TAuthData | null;

    constructor() {
        this.data = null;
    }

    private _getFieldOrNull(field: unknown) {
        return (field === null || field === undefined)
            ? null
            : field;
    }

    updateToken(token: TJwtToken | null | undefined) {
        if (token === null || token === undefined) {
            this.data = null;
        } else {
            this.data = {
                name: token.unique_name,
                id: token.sub,
                exp: token.exp,
                role: MapAuthRole(token.role)
            }
        }
    }

    getUserName() {
        return this._getFieldOrNull(this.data?.name);
    }

    getUserId() {
        return this._getFieldOrNull(this.data?.id);
    }

    getUserRole() {
        return this._getFieldOrNull(this.data?.role);
    }

    isUserAuthorized() {
        if (!this.data) return false;
        if (this.data.role === AuthMap.Guest) return false;
        if (Date.now() > this.data.exp) return false;

        return true;
    }

    isUserMod() {
        return ( this.data !== null ) && ( this.data.role >= AuthMap.Operator );
    }

    isUserAdmin() {
        return ( this.data !== null ) && ( (this.data.role & AuthMap.Administrator) === AuthMap.Administrator );
    }
}

const AuthSingleton = new _AuthSingleton();
export default AuthSingleton;