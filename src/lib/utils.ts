import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
	const formatter = new Intl.NumberFormat('en-us', {
		style: 'currency',
		currency: 'USD'
	});
	return formatter.format(amount);
}