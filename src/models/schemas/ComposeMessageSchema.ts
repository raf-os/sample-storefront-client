import z from "zod";

export const ComposeMessageSchema = z.object({
  userId: z.string().min(1, "Target user field cannot be empty."),
  title: z.string().max(50, "Message title must not surpass 50 characters.").optional(),
  content: z.string().min(3, "Your message must be at least 3 characters long."),
});

