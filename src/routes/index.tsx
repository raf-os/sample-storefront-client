import { z } from "zod";

import { createFileRoute } from '@tanstack/react-router';
import Layout from '@/components/layout';

import ProductListRenderer from "@/components/common/ProductListRenderer";

import PriceRangeFilter from "@/components/filters/PriceRangeFilter";
import CategoryFilter from "@/components/filters/CategoryFilter";

const SearchParamsSchema = z.object({
	offset: z.int().optional(),
});

export const Route = createFileRoute('/')({
	component: Index,
	validateSearch: search => SearchParamsSchema.parse(search)
})

function Index() {
	const { offset: pageOffset } = Route.useSearch();

	return (
		<>
		<HeroPresentation />

		<Layout.Root>
			<Layout.LeftSidebar className='gap-4'>
				<PriceRangeFilter />
				<CategoryFilter />
			</Layout.LeftSidebar>

			<Layout.Main>
				<ProductListRenderer offset={ pageOffset } />

				{/* <div className="flex gap-2">
					<PaletteTest colName="base" />
					<PaletteTest colName="primary" />
					<PaletteTest colName="warning" />
					<PaletteTest colName="destructive" />
				</div> */}
			</Layout.Main>

			<Layout.RightSidebar>
				Right sidebar
			</Layout.RightSidebar>
		</Layout.Root>

		</>
	)
}

function PaletteTest({colName}:{colName:string}) {
	const colors = [...Array(5).keys()].map((_, idx) => `var(--col-${colName}-${idx+1}00` );
	return (
		<ul className="flex flex-col gap-1">
			{ colors.map((col, idx) => (
				<li
					key={idx}
					style={{
						color: `var(--col-${colName}-content`,
						backgroundColor: col
					}}
					className="size-12 rounded-lg text-center"
				>
					text
				</li>
			)) }
		</ul>
	)
}

function HeroPresentation() {
	return (
		<div
			className="relative flex flex-nowrap items-center justify-center w-full h-120 bg-base-200 z-0"
		>
			<div className='flex flex-col px-4 xl:px-0 w-full xl:w-[1024px] h-3/4 lg:justify-center'>
				<h1
					className="font-bold text-4xl mb-1"
				>
					Huge savings just for you
				</h1>

				<div className="text-muted">
					<p>Save up to 0.1% on select items!</p>
					<p>Offer only available until the heat death of the universe.</p>
				</div>
			</div>

			<div className='absolute flex top-0 left-0 xl:-translate-x-[240px] grow-0 shrink-0 w-full h-full items-end justify-end overflow-hidden'>
				<img
					src="images/products/sample.webp"
					className='object-cover w-full lg:w-auto h-3/5 lg:h-full lg:object-contain'
					style={{
						maskImage: "linear-gradient(to left, transparent, white, transparent)"
					}}
				/>
			</div>
		</div>
	)
}