export type TCategory = {
    id: number,
    name: string,
    parentId?: number,
    parent?: TCategory
}

export type TCategoryDTO = {
    id: number,
    name: string,
}