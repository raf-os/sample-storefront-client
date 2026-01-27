import useDebounce from "@/hooks/useDebouce";
import { SearchUsersByName } from "@/lib/actions/userAction";
import { QueryKeys } from "@/lib/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import Input from "./Input";

import * as Popover from "@radix-ui/react-popover";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { paths } from "@/api/schema";

type TUserDataAlias = Required<Omit<paths['/api/User/{Id}']['get']['responses']['200']['content']['application/json'], "comments" | "products">>;

export default function UserSearchSelectInput({
  selectedId,
  setSelection
}: {
  selectedId?: string | null,
  setSelection?: (newValue: string) => void
}) {
  const [inputContent, setInputContent] = useState<string>("");
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [hoverIndex, setHoverIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [targetData, setTargetData] = useState<TUserDataAlias | null>(null);
  const debouncedInput = useDebounce(inputContent, 500);

  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: QueryKeys.User.UserSearch(debouncedInput),
    queryFn: () => SearchUsersByName(debouncedInput),
    enabled: !!debouncedInput && debouncedInput.length > 2,
  });

  const selectedItemRender = useCallback(() => {
    if (!targetData) return null;
    return (
      <div
        className="rounded-field border border-base-300 bg-base-200 text-sm font-medium leading-none shadow-xs px-2 py-1"
      >
        <p>{targetData.name}</p>
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

  const handlePopoverChange = (newVal: boolean) => {
    setIsPopoverOpen(newVal);
  }

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!inputRef.current) return;

    if (event.key === "Backspace") {
      if (!inputRef.current) return;
      if (inputRef.current.selectionStart === inputRef.current.selectionEnd && inputRef.current.selectionStart === 0) {
        setTargetData(null);
      }
    }

    if (!isSuccess) return;

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
          setIsPopoverOpen(false);
          setTargetData(data.at(hoverIndex) as any);
          setInputContent("");
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
          <div className="flex gap-2 uInput">
            {targetData && (
              selectedItemRender()
            )}
            <input
              value={inputContent}
              onChange={handleInputChange}
              className="grow-1 shrink-1 w-full"
              ref={inputRef}
              onKeyDown={handleInputKeyDown}
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
              {isSuccess ? (
                <div>
                  {data.length === 0 ? (
                    <div>
                      No results found.
                    </div>
                  ) : data.map((user, idx) => (
                    <UserSearchMatch
                      uid={user.id as string}
                      key={user.id}
                      rid={idx}
                      userName={user.name as string}
                      selectedId={hoverIndex}
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
  uid,
  rid,
  userName,
  selectedId
}: {
  uid: string,
  rid: number,
  userName: string,
  selectedId: number
}) {
  return (
    <div
      className={cn(
        "popupItem",
      )}
      data-selected={rid === selectedId}
    >
      {userName}
    </div>
  )
}
