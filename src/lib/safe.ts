export function safe<T extends (...args: any[]) => any>(fn: T): ReturnType<T> | null {
	try {
		return fn();
	} catch (error) {
		return null;
	}
}