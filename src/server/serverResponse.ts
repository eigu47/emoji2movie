export function successResponse<T = undefined>(data?: T) {
  return { error: null, ...(data as T) };
}

export function errorResponse<T>(error: T, errorInstance?: unknown) {
  console.error(error, ...(errorInstance ? [': ', errorInstance] : []));
  return { error };
}

export type ServerResponse<T = undefined, E = undefined> =
  | ReturnType<typeof successResponse<T>>
  | ReturnType<typeof errorResponse<E>>;
