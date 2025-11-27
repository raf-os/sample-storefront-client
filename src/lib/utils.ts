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

export function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	const formatter = new Intl.NumberFormat('un-US', {
		maximumFractionDigits: 2,
		minimumFractionDigits: 0
	});

	return formatter.format(bytes / Math.pow(k, i)) + '' + sizes[i];
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

export function toFormData(data: object): FormData {
	const formData = new FormData();

	Object.entries(data).forEach(([key, value]) => {
		if (value instanceof FileList) {
			Array.from(value).forEach((file) => {
				formData.append(key, file);
			});
		} else if (Array.isArray(value)) {
			value.forEach((item: unknown) => {
				formData.append(key, item instanceof File ? item : String(item));
			})
		} else if (value !== null && value !== undefined) {
			formData.append(key, String(value));
		}
	});

	return formData;
}
