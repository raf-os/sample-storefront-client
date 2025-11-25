import z from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const ImageUploadSchema = z
    .instanceof(File)
    .refine(file =>
        file.size < MAX_FILE_SIZE,
        "File size must not exceed 5MB.")
    .refine(file =>
        ACCEPTED_IMAGE_TYPES.includes(file.type),
        "Only .jpg, .jpeg, .png and .webp formats are supported.");