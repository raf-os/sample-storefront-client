import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { StandardJsonResponse } from "@/types/StandardJsonResponse";

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

export async function requestToJson<T = StandardJsonResponse>(res: Response): Promise<T | null> {
	const text = await res.text();
	if (!text) return null;
	return JSON.parse(text) as T;
}