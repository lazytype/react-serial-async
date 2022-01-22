export function isPromiseLike<T extends PromiseLike<unknown>, U>(
  value: T | U
): value is T;
export function isPromiseLike(value: unknown): value is PromiseLike<unknown>;
export function isPromiseLike(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    'then' in value &&
    typeof (value as { then: unknown }).then === 'function'
  );
}
