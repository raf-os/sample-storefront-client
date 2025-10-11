import { useState, createContext, useContext } from "react";
import { cn } from "@/lib/utils";
import { Command } from "cmdk";
import Card from "@/components/card";
import { Search } from "lucide-react";

type TCategoryItem = {
    label: string,
    name: string,
}

const Categories: TCategoryItem[] = [{
    label: "Drogas",
    name: "drugs"
}, {
    label: "Propane and propane accessories",
    name: "hank-hill"
}];

const totalCategories = Categories.length;

type TCategoryFilterContext = {
    toggleCategorySelection: (index: number) => void,
    categoryMask: Uint8Array,
}
const CategoryFilterContext = createContext<TCategoryFilterContext>({
    toggleCategorySelection: () => {},
    categoryMask: new Uint8Array(totalCategories),
});

export type CategoryFilterProps = React.ComponentPropsWithRef<'div'>;

export default function CategoryFilter() {
    const [ categoryMask, setCategoryMask ] = useState<Uint8Array>(new Uint8Array(totalCategories));
    // uint8 (1byte) is supposedly 8x smaller than default float64 (8 bytes) that JS uses for its "number" data type.
    // It's still not a bit array but this is javascript, you take what you can get, and writing a small
    // WASM module for this is overkill (well, MORE than this right here)

    const clearSelection = () => {
        setCategoryMask(new Uint8Array(totalCategories));
    }

    const onCategorySelected = (index: number) => {
        setCategoryMask(prev => {
            prev[index] ^= 1; // XOR, toggles this item
            return prev;
        });
    }

    const ctx: TCategoryFilterContext = {
        toggleCategorySelection: onCategorySelected,
        categoryMask: categoryMask
    }

    return (
        <Card.Root>
            <Card.Header>
                Category
            </Card.Header>

            <CategoryFilterContext value={ctx}>
            <Card.Body>
                <Command className="flex flex-col border border-base-100 h-64 rounded-box shadow-md overflow-hidden">
                    <div className="flex relative items-center">
                        <div className="absolute top-1/2 -translate-y-1/2 left-1.5 text-base-400">
                            <Search size={20} />
                        </div>
                    
                        <Command.Input
                            className="w-full outline-none bg-base-100 pl-8 pr-2 py-2"
                            placeholder="Search"
                        />
                    </div>
                    <Command.List className="text-sm">
                        <Command.Empty className="px-2 py-1 text-muted">
                            No results found.
                        </Command.Empty>
                        { Categories.map((cat, idx) => (
                            <CategoryItem
                                value={cat.name}
                                key={`categoryList[${idx}]__${cat.label}`}
                                categoryId={idx}
                            >
                                {cat.label}
                            </CategoryItem>
                        )) }
                    </Command.List>
                </Command>
            </Card.Body>
            </CategoryFilterContext>
        </Card.Root>
    )
}

type CategoryItemProps = React.ComponentPropsWithRef<typeof Command.Item> & {
    categoryId: number
};

function CategoryItem({ children, value, categoryId }: CategoryItemProps) {
    const { categoryMask, toggleCategorySelection } = useContext(CategoryFilterContext);

    const isItemSelected = categoryMask[categoryId] == 1;

    const handleSelection = () => {
        toggleCategorySelection(categoryId);
    };

    return (
        <Command.Item
            className="gap-2 px-2 py-1 group cursor-pointer"
            value={value}
            onSelect={handleSelection}
        >
            <span
                className={cn(
                    "inline-block mr-2 size-3 bg-base-500 rounded-[2px] overflow-hidden",
                )}
            >
                { isItemSelected && `✓` }
            </span>

            { children }
        </Command.Item>
    )
}