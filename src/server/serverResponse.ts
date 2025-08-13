export function successResponse<T = undefined>(data?: T) {
  return { error: null, data: data as T };
}

export function errorResponse<T = string>(error: T, errorInstance?: unknown) {
  console.error(
    error,
    ...(errorInstance ? [': ', errorInstance] : [errorInstance])
  );
  return { error, data: null };
}

export type ServerResponse<T = undefined, E = string> =
  | ReturnType<typeof successResponse<T>>
  | ReturnType<typeof errorResponse<E>>;
