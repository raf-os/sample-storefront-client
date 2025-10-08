import { createFileRoute } from '@tanstack/react-router';
import Layout from '@/components/layout';
import ShopItemCard from '@/components/shop-item/ShopItemCard';

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
	return (
		<Layout.Root>
			<Layout.LeftSidebar className='gap-4'>
				<h1>
					Product list
				</h1>

				<div className="flex flex-col">
					<input
						className="bg-base-200 rounded-lg px-2 py-1 text-base-500 placeholder:text-base-300 outline-base-400 focus:outline-2"
						placeholder="Search"
					/>
				</div>

				<h1>
					Category list
				</h1>

				<ul>
					<li>Category 1</li>
					<li>Category 2</li>
				</ul>
			</Layout.LeftSidebar>

			<Layout.Main>
				<div className="grid grid-cols-3 gap-4">
					<ShopItemCard
						itemName="Sample sale item lorem ipsum dolor sit amet"
						itemPrice={69420}
						itemDiscount={25}
					/>

					<ShopItemCard
						itemName="Sample normal item"
						itemPrice={420}
					/>

					<ShopItemCard
						itemName="Fentanyl"
						itemPrice={50}
					/>
				</div>

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