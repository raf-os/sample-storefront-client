import * as Slider from "@radix-ui/react-slider";
import Card from "@/components/card";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function PriceRangeFilter() {
    const minValue = 1;
    const maxValue = 1000;
    const [ sliderValues, setSliderValues ] = useState<number[]>([minValue, maxValue]);
    return (
        <Card.Root>
            <Card.Header>
                Price range
            </Card.Header>

            <Card.Body>
                <div
                    className="flex justify-between text-sm font-medium"
                >
                    <div>$ { sliderValues[0] }</div>
                    <div>$ { sliderValues[1] } { (sliderValues[1] >= maxValue) && `+` }</div>
                </div>

                <Slider.Root
                    className="relative flex items-center w-full mb-1"
                    min={minValue}
                    max={maxValue}
                    step={1}
                    value={sliderValues}
                    onValueChange={setSliderValues}
                >
                    <Slider.Track
                        className="relative h-1 rounded-full grow bg-base-100"
                    >
                        <Slider.Range
                            className="absolute h-full rounded-full bg-base-400"
                        />
                    </Slider.Track>
                    <CustomSlider
                        key="slider-left"
                    />
                    <CustomSlider
                        key="slider-right"
                    />
                </Slider.Root>
            </Card.Body>
        </Card.Root>
    )
}

function CustomSlider({ children, className, ...rest }: React.ComponentPropsWithRef<'span'>) {
    return (
        <Slider.Thumb
            className={cn(
                "block size-4 rounded-full bg-base-500 outline-1 outline-base-300 focus:ring-4 focus:ring-base-500 shadow-md",
                className
            )}
            {...rest}
        >
            { children }
        </Slider.Thumb>
    )
}