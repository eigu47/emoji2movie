import { Dispatch, SetStateAction } from 'react';

export type ReactSetState<T> = Dispatch<SetStateAction<T>>;
export type ReactState<T> = [T, ReactSetState<T>];

export type MovieList = {
  id: number;
  title: string;
  vote: number;
  year: number;
};
