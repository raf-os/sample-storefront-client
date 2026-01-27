import z from 'zod';
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react';
import type { paths } from '@/api/schema';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { FieldSet, Input, TextArea } from '@/components/forms';
import useDebounce from '@/hooks/useDebouce';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/lib/queryKeys';
import { SearchUsersByName } from '@/lib/actions/userAction';
import UserSearchSelectInput from '@/components/forms/UserSearchSelectInput';

const ComposeSearchSchema = z.object({
  to: z.guid().optional(),
});

const ComposeMessageSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(3),
});

type TUserDataAlias = Required<Omit<paths['/api/User/{Id}']['get']['responses']['200']['content']['application/json'], "comments" | "products">>;

export const Route = createFileRoute('/app/user/inbox/compose')({
  component: RouteComponent,
  validateSearch: search => ComposeSearchSchema.parse(search),
})

function RouteComponent() {
  const [targetPreview, setTargetPreview] = useState<TUserDataAlias | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const search = Route.useSearch();
  const methods = useForm<z.infer<typeof ComposeMessageSchema>>({
    resolver: zodResolver(ComposeMessageSchema)
  });

  const { handleSubmit } = methods;

  useEffect(() => {
    if (search.to === undefined || search.to === null) return;
    setTargetId(search.to);
  }, [search.to]);

  const onSubmit = () => {
    //
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormProvider {...methods}>
        <div>
          <UserSearchSelectInput
            selectedId={targetId}
          />
          <FieldSet
            name="title"
            label="Title"
            as={Input}
          />
        </div>
      </FormProvider>
    </form>
  )
}

