import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { StandardJsonResponse } from "@/types/StandardJsonResponse";
import GlobalConfig from "@/lib/globalConfig";

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

export function composeTitle(newTitle?: string) {
	return newTitle === undefined ? GlobalConfig.AppTitle : `${newTitle} | ${GlobalConfig.AppTitle}`
}

export function composeRefs<T>(...refs: (React.Ref<T> | undefined)[]): (instance: T | null) => void {
	return (instance: T | null) => {
		for (const ref of refs) {
			if (!ref) continue;

			if (typeof ref === 'function') {
				ref(instance);
			} else {
				(ref as React.RefObject<T | null>).current = instance;
			}
		}
	}
}
