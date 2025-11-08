import { requestToJson } from "@/lib/utils";
import GlobalConfig from "@/lib/globalConfig";
import type { StandardJsonResponse } from "@/types/StandardJsonResponse";

export type CategoryTreeNode = {
    id: number,
    name: string,
    children?: CategoryTreeNode[],
    keywords?: string[],
    parents?: number[],
    childIds?: number[]
}

export type CategoryTree = CategoryTreeNode[];

export type TreeData = {
    compiledTree: CategoryTree,
    flatTree: CategoryTreeNode[],
}

export async function RequestCategoryModel(): Promise<StandardJsonResponse<TreeData>> {
    try {
        const res = await fetch(GlobalConfig.ServerCategoryEndpoint, {
            method: "GET"
        });

        const data = await requestToJson<{ categories: TreeData }>(res);

        if (!res.ok) {
            return {
                success: false,
                message: "Error fetching data from server."
            }
        }

        return {
            success: true,
            data: data?.categories || undefined
        }
    } catch(err) {
        console.error(err);
        return {
            success: false,
            message: "Error contacting server."
        }
    }
}