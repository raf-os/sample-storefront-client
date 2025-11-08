import { useState, useTransition, useEffect } from "react";
import { RequestCategoryModel, type TreeData } from "@/lib/actions/categoryAction";

const CACHE_TIMER_IN_MINUTES = 10;
let cacheInstance: CategoryTreeCache | undefined = undefined;

export class CategoryTreeCache {
    cachedValue: TreeData | undefined = undefined;
    expiry: number = 0;

    constructor() {
        if (cacheInstance !== undefined) {
            throw new Error("Attempting to create more than one 'CategoryTreeCache' singleton instance.");
        }

        cacheInstance = this;
    }

    static GetInstance() {
        if (cacheInstance && (cacheInstance instanceof CategoryTreeCache)) {
            return cacheInstance;
        } else {
            return new CategoryTreeCache();
        }
    }

    Invalidate() {
        this.expiry = 0;
        this.cachedValue = undefined;
    }

    async ForceUpdate() {
        this.Invalidate();
        await this.TryGetValue();
    }

    async TryGetValue() {
        if (Date.now() > this.expiry) {
            const newVal = await this._GetValue();
            if (newVal == undefined || newVal == null) {
                return this.cachedValue;
            }
            this.expiry = Date.now() + CACHE_TIMER_IN_MINUTES * 60 * 1000;
            this.cachedValue = newVal;
            return this.cachedValue;
        } else {
            return this.cachedValue;
        }
    }

    private async _GetValue() {
        const req = await RequestCategoryModel();
        if (req.success) return req.data;
        else {
            console.log("Error trying to update category tree model: ", req.message);
        }
    }
}

export default function useCategoryTree() {
    const [ isPending, startTransition ] = useTransition();
    const [ categoryTree, setCategoryTree ] = useState<TreeData | undefined>(undefined);

    useEffect(() => {
        startTransition(async () => {
            const data = await CategoryTreeCache.GetInstance().TryGetValue();

            if (data) {
                setCategoryTree(data);
            }
        });
    }, []);

    return {
        isRequestPending: isPending,
        categoryTree: categoryTree?.compiledTree,
        flatTree: categoryTree?.flatTree
    }
}