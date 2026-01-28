import useDebounce from "@/hooks/useDebouce";
import { GetMinimalUserData, SearchUsersByName } from "@/lib/actions/userAction";
import { QueryKeys } from "@/lib/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

import * as Popover from "@radix-ui/react-popover";
import { cn, composeRefs } from "@/lib/utils";
import type { paths } from "@/api/schema";
import ImagePromise from "../common/ImagePromise";
import { ServerImagePath } from "@/lib/serverRequest";

import { ShieldIcon } from "lucide-react";
import { useServerAction } from "@/hooks";

type TUserDataAlias = Required<Omit<paths['/api/User/{Id}']['get']['responses']['200']['content']['application/json'], "comments" | "products">>;

type TUserSearchSelectInputProps = React.ComponentPropsWithRef<'input'> & {};

export default function UserSearchSelectInput({
  className,
  value: _,
  type,
  'aria-invalid': ariaInvalid,
  ref,
  name,
  defaultValue,
  disabled,
  ...rest
}: TUserSearchSelectInputProps) {
  const [inputContent, setInputContent] = useState<string>("");
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [hoverIndex, setHoverIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [targetData, setTargetData] = useState<TUserDataAlias | null>(null);
  const debouncedInput = useDebounce(inputContent, 500);
  const formMethods = useFormContext();

  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: QueryKeys.User.UserSearch(debouncedInput),
    queryFn: () => SearchUsersByName(debouncedInput),
    enabled: !!debouncedInput && debouncedInput.length > 2,
  });

  const [isPending, startTransition] = useServerAction();

  const selectedItemRender = useCallback(() => {
    if (!targetData) return null;
    return (
      <div
        className="rounded-field border border-base-300 bg-base-200 text-sm font-medium leading-none shadow-xs px-2 py-1"
      >
        <RenderUserName udata={targetData as TUserDataAlias} />
      </div>
    )
  }, [targetData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setInputContent(newVal);
  }

  useEffect(() => {
    if (debouncedInput.length > 2) {
      setIsPopoverOpen(true);
    } else {
      setIsPopoverOpen(false);
    }
  }, [debouncedInput]);

  useEffect(() => {
    if (!defaultValue || typeof defaultValue !== "string") return;

    startTransition(async () => {
      const data = await GetMinimalUserData(defaultValue);
      if (data) {
        setTargetData(data as TUserDataAlias);
        if (name) formMethods?.setValue(name, data.id);
      }
    });
  }, [defaultValue]);

  useEffect(() => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus = () => {
        inputRef.current?.focus();
      }
    }
  }, []);

  const handlePopoverChange = (newVal: boolean) => {
    setIsPopoverOpen(newVal);
  }

  const triggerHover = (idx: number) => {
    if (idx >= 0 && idx <= (data?.length || 0)) {
      setHoverIndex(idx);
    }
  }

  const triggerSelection = (idx: number) => {
    if (!data) return;
    if (data.length === 0) { setIsPopoverOpen(false); }
    if (idx >= 0 && idx <= (data?.length || 0)) {
      const selectedUser = data.at(idx);
      setIsPopoverOpen(false);
      setTargetData(selectedUser as any);
      setInputContent("");
      if (name) formMethods?.setValue(name, selectedUser?.id ?? "");
    }
  }

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!inputRef.current) return;

    if (event.key === "Backspace") {
      if (!inputRef.current) return;
      if (inputRef.current.selectionStart === inputRef.current.selectionEnd && inputRef.current.selectionStart === 0) {
        setTargetData(null);
      }
    }

    if (!isSuccess || !data) return;

    switch (event.key) {
      case 'Tab':
      case 'ArrowDown':
        if (isPopoverOpen) {
          event.preventDefault();
          setHoverIndex(current => (current + 1) % (data.length));
        }
        break;

      case 'Enter':
        if (isPopoverOpen) {
          event.preventDefault();
          triggerSelection(hoverIndex);
        }
        break;

      case 'ArrowUp':
        if (isPopoverOpen) {
          event.preventDefault();
          setHoverIndex(current => current === 0 ? data.length - 1 : current - 1);
        }
        break;
    }
  }


  return (
    <div className="flex flex-col">
      <Popover.Root
        open={isPopoverOpen}
        onOpenChange={handlePopoverChange}
      >
        <Popover.Anchor>
          <div className={cn(
            "flex uInput px-1",
            className
          )}
            aria-invalid={ariaInvalid}
          >
            {targetData && (
              selectedItemRender()
            )}
            <input
              value={inputContent}
              onChange={handleInputChange}
              className="grow-1 shrink-1 w-full px-2"
              ref={inputRef}
              onKeyDown={handleInputKeyDown}
              type={type}
              disabled={isPending || disabled}
            />

            <input
              type="hidden"
              value={targetData ? targetData.id : ""}
              ref={composeRefs(ref, hiddenInputRef)}
              {...rest}
            />
          </div>
        </Popover.Anchor>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={2}
            onOpenAutoFocus={e => e.preventDefault()}
            onCloseAutoFocus={e => e.preventDefault()}
            className="popup-menu"
          >
            <div className="inner">
              {(isSuccess || data) ? (
                <div>
                  {data.length === 0 ? (
                    <div>
                      No results found.
                    </div>
                  ) : data.map((user, idx) => (
                    <UserSearchMatch
                      udata={user as TUserDataAlias}
                      key={user.id}
                      rid={idx}
                      selectedId={hoverIndex}
                      triggerHover={triggerHover}
                      triggerSelection={triggerSelection}
                    />
                  ))}
                </div>
              ) : (
                isLoading ? (
                  <>Loading...</>
                ) : isError && (
                  <span className="opacity-75">
                    Error searching for users.
                  </span>
                )
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}

function UserSearchMatch({
  udata,
  rid,
  selectedId,
  triggerHover,
  triggerSelection
}: {
  /**
    * Database ID
    */
  udata: TUserDataAlias,
  /**
    * Redering order
    */
  rid: number,
  selectedId: number,
  triggerHover: (idx: number) => void,
  triggerSelection: (idx: number) => void,
}) {
  return (
    <div
      className={cn(
        "popupItem flex gap-2 items-center",
      )}
      data-selected={rid === selectedId}
      onMouseEnter={() => triggerHover(rid)}
      onClick={() => triggerSelection(rid)}
    >
      <div className="gap-2 size-6 overflow-hidden rounded-full">
        <ImagePromise
          src={udata.avatarUrl ? ServerImagePath("/files/avatar/{FileName}", { path: { FileName: udata.avatarUrl } }) : null}
          fallback={<img src="/images/default-avatar.webp" alt="Default user avatar" />}
          loadingComponent={<div className="w-full shimmer" />}
          alt="User avatar"
        />
      </div>
      <RenderUserName udata={udata} />
    </div>
  )
}

function RenderUserName({
  udata
}: {
  udata: TUserDataAlias
}) {
  return (
    <div className="flex gap-[0.25em]">
      {udata.role > 0 && (
        <ShieldIcon
          size="1em"
          className={cn(
            "stroke-1 stroke-base-500 fill-base-300",
            udata.role === 1 ? "fill-lime-500"
              : udata.role === 2 ? "fill-amber-500"
                : null
          )}
        />
      )}
      <p>
        {udata.name}
      </p>
    </div>
  )
}
