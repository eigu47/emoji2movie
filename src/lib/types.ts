import { type Dispatch, type SetStateAction, type useActionState } from 'react';

export type ReactSetState<T> = Dispatch<SetStateAction<T>>;
export type ReactState<T> = [T, ReactSetState<T>];

export type ActionState<Action extends (...args: any[]) => any> = ReturnType<
  typeof useActionState<Parameters<Action>[0], Parameters<Action>[1]>
>;

export type MovieList = {
  id: number;
  title: string;
  vote: number;
  year: number;
};
