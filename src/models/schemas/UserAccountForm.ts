import z from "zod";

export const UserAccountForm = z.object({
    password: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(4, "Password must be at least 4 characters long.").optional().or(z.literal("")),
    newPasswordConfirm: z.string().optional(),
    email: z.email()
}).superRefine((data, ctx) => {
    if (data.newPassword !== data.newPasswordConfirm) {
        ctx.addIssue({
            code: "custom",
            message: "Passwords do not match.",
            path: ["newPassword2"]
        });
    }
});