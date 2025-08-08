export function successResponse<T = undefined>(data?: T) {
  return {
    ok: true as const,
    data: data as T,
  };
}

export function errorResponse<T>(message: T, error?: unknown) {
  console.error(message, ...(error ? [': ', error] : []));
  return {
    ok: false as const,
    message,
  };
}

export type ServerResponse<T = undefined, E = undefined> =
  | ReturnType<typeof successResponse<T>>
  | ReturnType<typeof errorResponse<E>>;
