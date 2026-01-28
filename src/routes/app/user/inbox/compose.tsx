import z from 'zod';
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react';
import type { paths } from '@/api/schema';
import { useForm, FormProvider, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { FieldSet, Input, TextArea } from '@/components/forms';
import UserSearchSelectInput from '@/components/forms/UserSearchSelectInput';
import Button from '@/components/button';
import { ComposeMessageSchema } from '@/models/schemas';
import { useServerAction } from '@/hooks';
import { SendPrivateMessage } from '@/lib/actions/userAction';
import ErrorComponent from '@/components/common/ErrorComponent';
import { cn } from '@/lib/utils';

const ComposeSearchSchema = z.object({
  to: z.guid().optional(),
});

type TUserDataAlias = Required<Omit<paths['/api/User/{Id}']['get']['responses']['200']['content']['application/json'], "comments" | "products">>;

export const Route = createFileRoute('/app/user/inbox/compose')({
  component: RouteComponent,
  validateSearch: search => ComposeSearchSchema.parse(search),
})

function RouteComponent() {
  const search = Route.useSearch();
  const methods = useForm<z.infer<typeof ComposeMessageSchema>>({
    resolver: zodResolver(ComposeMessageSchema)
  });
  const [isPending, startTransition, errorMessage, isSuccess] = useServerAction();

  const { handleSubmit } = methods;

  const onSubmit: SubmitHandler<z.infer<typeof ComposeMessageSchema>> = (data) => {
    // console.log(data);
    startTransition(async () => {
      await SendPrivateMessage(data);
    });
  }

  if (isSuccess) {
    return (
      <div>
        Message sent successfully!
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormProvider {...methods}>
        <div className={cn("flex flex-col gap-2", isPending && "opacity-50")}>
          {errorMessage && (
            <ErrorComponent errorMessage={errorMessage} />
          )}
          <FieldSet
            label="To:"
            as={UserSearchSelectInput}
            name="userId"
            errorAlignment='horizontal'
            defaultValue={search.to || ""}
            disabled={isPending}
          />

          <FieldSet
            name="title"
            label="Title"
            as={Input}
            errorAlignment='horizontal'
            disabled={isPending}
          />

          <FieldSet
            name="content"
            label="Message"
            as={TextArea}
            rows={8}
            errorAlignment='horizontal'
            disabled={isPending}
          />

          <Button
            type="button"
            className="btn-primary"
            onClick={() => handleSubmit(onSubmit)()}
            disabled={isPending}
          >
            Send
          </Button>
        </div>
      </FormProvider>
    </form>
  )
}

