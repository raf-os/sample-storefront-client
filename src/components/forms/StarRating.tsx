import { cn } from "@/lib/utils";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

import { Star } from "lucide-react";

export function StarRatingComponent({
    name,
    disabled = false,
    ...rest
}: {
    name: string,
    disabled?: boolean
}) {
    const [ selectedRating, setSelectedRating ] = useState<number | null>(null);
    const [ hoveredRating, setHoveredRating ] = useState<number | null>(null);
    const { register, setValue } = useFormContext();

    const handleDisabled = <T extends (...args: any[]) => any,>(callback: T) => {
        return ((...args: Parameters<T>) => {
            if (disabled) { return; }
            else return callback(...args);
        })
    }

    const handleOnHover = handleDisabled((value: number) => {
        setHoveredRating(value);
    });

    const handleOnSelect = handleDisabled((value: number) => {
        setSelectedRating(value);
        setValue(name, value + 1);
    });

    const handleOnMouseLeave = () => {
        setHoveredRating(null);
    }

    return (
        <div className="flex gap-4 items-center">
            <div
                className="flex self-start grow-0 shrink-0 border border-base-300 rounded-box p-1 shadow-xs"
                onMouseLeave={handleOnMouseLeave}
            >
                <input {...register(name, { valueAsNumber: true })} type="hidden" value={selectedRating ?? 0} />
                { [...Array(5)].map((_, idx) => (
                    <StarComp
                        key={idx}
                        idx={idx}
                        hoverIdx={hoveredRating}
                        selectedIdx={selectedRating}
                        onHovered={handleOnHover}
                        onSelected={handleOnSelect}
                    />
                )) }
            </div>

            <div>
                <span className="text-xl font-bold">{ (hoveredRating ?? selectedRating ?? -1) + 1 }</span>
                <span className="text-xs"> / 5</span>
            </div>
        </div>
    )
}

type StarCompProps = {
    idx: number,
    hoverIdx: number | null,
    selectedIdx: number | null,
    onHovered?: (value: number) => void,
    onSelected?: (value: number) => void,
}

function StarComp({ idx, hoverIdx, selectedIdx, onHovered, onSelected }: StarCompProps) {
    let myColor = "";

    if (hoverIdx !== null) {
        if (hoverIdx >= idx) {
            myColor = "fill-amber-500";
        } else {
            myColor = "fill-base-500/50";
        }
    } else {
        if (selectedIdx !== null) {
            if (selectedIdx >= idx)
                myColor = "fill-amber-400";
            else
                myColor = "fill-base-500/25";
        } else myColor = "fill-base-500/25";
    }
    return (
        <div
            className="px-1"
            onMouseOver={() => onHovered?.(idx)}
            onClick={() => onSelected?.(idx)}
        >
            <Star
                
                className={cn(
                    "stroke-0 size-8",
                    myColor
                )}
            />
        </div>
    )
}