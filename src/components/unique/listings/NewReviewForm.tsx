import { useTransition } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FieldSet, StarRatingComponent, TextArea } from "@/components/forms";
import Button from "@/components/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import { useServerAction } from "@/hooks";
import { AddCommentAction } from "@/lib/actions/commentAction";

const NewReviewSchema = z.object({
    rating: z.number()
        .min(0, "Score must be between 0 and 5.")
        .max(5, "Score must be between 0 and 5."),
    content: z.string()
        .max(500, "Review must be under 500 characters.")
});

export function NewReviewForm({
    productId
}: {
    productId: string
}) {
    const [ isPending, startTransition, errorMessage, clearError ] = useServerAction();
    const navigate = useNavigate();
    const formMethods = useForm<z.infer<typeof NewReviewSchema>>({
        resolver: zodResolver(NewReviewSchema)
    });
    const { handleSubmit } = formMethods;

    const onSubmit = (data: z.infer<typeof NewReviewSchema>) => {
        if (isPending) return;

        startTransition(async () => {
            const res = await AddCommentAction(data, productId);

            if (!res.success) throw new Error(res.message);
            else navigate({ to: '.' });
        });
    }

    return (
        <FormProvider {...formMethods}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div
                    className="flex flex-col gap-4 bg-base-200 rounded-box p-4"
                >
                    <h1 className="text-lg font-semibold">
                        Leave a review
                    </h1>

                    { errorMessage && (
                        <p className="text-sm text-destructive-content">
                            { errorMessage }
                        </p>
                    )}

                    <FieldSet
                        name="rating"
                        label="Rating"
                        as={StarRatingComponent}
                        disabled={isPending}
                    />

                    <FieldSet
                        name="content"
                        label="Review"
                        as={TextArea}
                        disabled={isPending}
                    />

                    <Button
                        className="btn-primary"
                        type="submit"
                        disabled={isPending}
                    >
                        Submit
                    </Button>
                </div>
            </form>
        </FormProvider>
    )
}