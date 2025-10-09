import { createFileRoute } from '@tanstack/react-router';
import Layout from '@/components/layout';
import ShopItemCard from '@/components/shop-item/ShopItemCard';

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
	return (
		<>
		<HeroPresentation />

		<Layout.Root>
			<Layout.LeftSidebar className='gap-4'>
				<h1
					className="font-bold"
				>
					Category list
				</h1>

				<ul>
					<li>Category 1</li>
					<li>Category 2</li>
				</ul>
			</Layout.LeftSidebar>

			<Layout.Main>
				<ul className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
					<ShopItemCard
						itemName="Sample sale item lorem ipsum dolor sit amet"
						itemPrice={69420}
						itemDiscount={25}
					/>

					<ShopItemCard
						itemName="Sample normal item with long text, larger than this container permits, thus lorem ipsum dolor sit amet"
						itemPrice={420}
						itemDiscount={5}
					/>

					<ShopItemCard
						itemName="Fentanyl"
						itemPrice={50}
					/>

					<ShopItemCard
						itemName="Title T"
						itemPrice={1234}
					/>
				</ul>

				<div className="flex gap-2">
					<PaletteTest colName="base" />
					<PaletteTest colName="primary" />
					<PaletteTest colName="warning" />
				</div>
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
			className="flex flex-col items-center justify-center text-center w-full h-120 bg-base-200"
		>
			<h1
				className="font-bold text-4xl"
			>
				Hero Component
			</h1>

			<div className="text-muted">
				<p>Long and pretentious subtext</p>
				<p>Lorem Ipsum dolor sit amet yada yada</p>
			</div>
		</div>
	)
}