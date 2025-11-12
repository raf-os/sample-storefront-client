export type TCategory = {
    id: number,
    name: string,
    parentId?: number,
    parent?: TCategory
}