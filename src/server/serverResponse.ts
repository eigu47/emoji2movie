export function successResponse<T = undefined>(data?: T) {
  return { error: null, data: data as T };
}

export type SuccessResponse<T = undefined> = ReturnType<
  typeof successResponse<T>
>;

export function errorResponse<T = string>(error: T, errorInstance?: unknown) {
  console.error(
    error,
    ...(errorInstance ? [': ', errorInstance] : [errorInstance])
  );
  return { error, data: null };
}

export type ErrorResponse<T = string> = ReturnType<typeof errorResponse<T>>;

export type ServerResponse<T = undefined, E = string> =
  | SuccessResponse<T>
  | ErrorResponse<E>;
