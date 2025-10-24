import { AuthRefresh, type TJwtToken } from "@/lib/actions/authAction";
import { EventBus } from "@/classes/EventBus";

let instance: TokenRefreshHandlerSingleton;

type TokenEvents = {
    onTokenRefreshed: TJwtToken | null,
    onTokenInvalid: void,
}

class TokenRefreshHandlerSingleton {
    public exp: number = 0;
    public Observable = new EventBus<TokenEvents>();

    constructor() {
        if (instance) {
            throw new Error("Attempted to create multiple TokenRefreshHandler instances.");
        }
        instance = this;
    }

    public updateExpireDate(newExpire: number) {
        this.exp = newExpire;
    }

    public isTokenValid(): boolean {
        const now = Date.now();
        const refreshBuffer = this.exp - (60 * 1000);

        const isValid = now < refreshBuffer;
        return isValid;
    }

    public async validateToken(
        opts?: {
            suppressEvents: boolean
        }) {
        if (this.isTokenValid()) return true;

        else {
            const refreshToken = await AuthRefresh();
            if (refreshToken) {
                if (!opts?.suppressEvents) this.Observable.emit("onTokenRefreshed", refreshToken);
                this.updateExpireDate(refreshToken.exp * 1000);
                return true;
            }
            else {
                if (!opts?.suppressEvents) this.Observable.emit("onTokenRefreshed", null);
                if (!opts?.suppressEvents) this.Observable.emit("onTokenInvalid");
                this.updateExpireDate(0);
                return false;
            }
        }
    }
}

const TokenRefreshHandler = new TokenRefreshHandlerSingleton();
export default TokenRefreshHandler;