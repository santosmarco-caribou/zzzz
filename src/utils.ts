import type { L, S } from 'ts-toolbelt'
import { AnyZType } from './z'

type Primitive = boolean | string | number | bigint | symbol | undefined | null

type BuiltIn =
  | { readonly [Symbol.toStringTag]: string }
  | Date
  | Error
  | Function
  | Generator
  | Primitive
  | RegExp

export type Simplify<T> = T extends BuiltIn
  ? T
  : { [K in keyof T]: Simplify<T[K]> }

export const simplify = <T>(value: T) => value as Simplify<T>

export type Merge<A, B> = Omit<A, keyof B> & B

export const merge = <A, B>(a: A, b: B) => ({ ...a, ...b } as Merge<A, B>)

export type ReadonlyDeep<T> = T extends BuiltIn
  ? T
  : { readonly [K in keyof T]: ReadonlyDeep<T[K]> }

export type Unique<T extends readonly unknown[]> = T extends []
  ? T
  : T extends [infer H extends T[0], ...infer R]
  ? [H, ...Unique<L.Filter<R, H, 'equals'>>]
  : never

export const unique = <T extends readonly unknown[]>(arr: T) =>
  [...new Set(arr)] as Unique<T>

export const readonlyDeep = <T>(value: T) => value as ReadonlyDeep<T>

export const get = <Z extends AnyZType, P extends keyof AnyZType>(
  z: Z,
  prop: P
) => z[prop]

/* --------------------------------- Strings -------------------------------- */

export const join = <T extends readonly string[], D extends string>(
  strings: T,
  delimiter: D
) => strings.join(delimiter) as S.Join<T, D>

export const split = <T extends string, D extends string>(
  string: T,
  delimiter: D
) => string.split(delimiter) as S.Split<T, D>

export const unionizeHints = <T extends readonly string[]>(hints: T) =>
  join(hints, ' | ')

export const isArray = <T>(value: T): value is Extract<T, readonly unknown[]> =>
  Array.isArray(value)

export const head = <T extends readonly unknown[]>(arr: T) => arr[0] as T[0]

export const tail = <T extends readonly unknown[]>(arr: T) =>
  arr.slice(1) as L.Tail<T>

export const concat = <
  A extends readonly unknown[],
  B extends readonly unknown[]
>(
  a: A,
  b: B
) => [...a, ...b] as [...A, ...B]

export const map = <T, U, TArr extends readonly T[] = readonly T[]>(
  arr: TArr,
  mapper: (value: T) => U
) => arr.map(mapper) as { [K in keyof TArr]: U }
