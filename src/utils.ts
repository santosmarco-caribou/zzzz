import type { S, T } from 'ts-toolbelt'

type BuiltIn =
  | { readonly [Symbol.toStringTag]: string }
  | Date
  | Error
  | Function
  | Generator
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

export const readonlyDeep = <T>(value: T) => value as ReadonlyDeep<T>

export const join = <
  T extends readonly [string, ...string[]],
  D extends string
>(
  strings: T,
  delimiter: D
) => strings.join(delimiter) as S.Join<T, D>

export const unionizeHints = <V extends string, T extends readonly [V, ...V[]]>(
  hints: T
) => join(hints, ' | ')

export const isArray = <T>(value: T): value is Extract<T, readonly unknown[]> =>
  Array.isArray(value)
