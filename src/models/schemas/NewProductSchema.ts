import z from "zod";
import { ImageUploadSchema } from "@/models/schemas/ImageUploadSchema";
import GlobalConfig from "@/lib/globalConfig";

export const NewProductSchema = z.object({
	name: z
		.string()
		.min(4, "Name must have at least 4 characters.")
		.max(100, "Name must be at most 100 characters long."),
	price: z.coerce
		.number("Price must be a number.")
		.positive("Price can't be negative."),
	description: z
		.string()
		.optional(),
	categories: z
		.array(z.number("Invalid category types."))
		//.transform(v => ([...v]))
		.optional(),
	files: z
		.array(ImageUploadSchema)
		.max(GlobalConfig.MaxImagesPerListing, `Only up to ${GlobalConfig.MaxImagesPerListing} files may be uploaded.`)
		.optional()
});