import { z } from "zod";

export const ProductPatchSchema = z.object({
    name: z
        .string()
        .min(4, "Name must have at least 4 characters.")
        .max(100, "Name must be at most 100 characters long.")
        .optional(),
    price: z.coerce
        .number<number>()
        .min(0, "Price can't be negative.")
        .optional(),
    discount: z.coerce
        .number<number>()
        .min(0)
        .max(100)
        .optional(),
    description: z
        .string()
        .optional(),
    categories: z
        .set(z.number())
        .transform(v => ([...v]))
        .optional()
});