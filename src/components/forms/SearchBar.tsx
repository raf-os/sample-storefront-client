import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

export default function SearchBar() {
    return (
        <div className="grow-1 shrink-1 flex relative">
            <Search className="absolute top-1/2 left-2 -translate-y-1/2 size-5 text-base-400" />

            <input
                placeholder="Search..."
                className={cn(
                    "pl-8 pr-1 py-1 rounded-field grow-1 shrink-1",
                    "bg-base-200 placeholder:text-base-300 text-base-400 focus:text-base-500",
                    "outline-0 focus:ring-2 ring-base-500"
                )}
            />
        </div>
    )
}