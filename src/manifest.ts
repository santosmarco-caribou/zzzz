import type { ZParsedType } from './types'

export interface DetailedBase {
  readonly title?: string
  readonly summary?: string
  readonly description?: string
}

export interface Detailed<V> extends DetailedBase {
  readonly value: V
}

export type DetailedArg<V> = V | Detailed<V>

export const parseStringDetailedArg = (
  arg: DetailedArg<string>
): Detailed<string> => {
  if (typeof arg === 'string') {
    return { value: arg }
  }
  return arg
}

export interface ZManifest<Output> extends DetailedBase {
  readonly type: ZParsedType | readonly [ZParsedType, ...ZParsedType[]]
  readonly examples?: readonly [Output, ...Output[]]
  readonly tags?: readonly [Detailed<string>, ...Detailed<string>[]]
  readonly notes?: readonly [Detailed<string>, ...Detailed<string>[]]
  readonly unit?: Detailed<string>
  readonly deprecated?: boolean
  readonly required?: boolean
  readonly nullable?: boolean
  readonly readonly?: boolean
}

export type AnyZManifest = ZManifest<unknown>

export const getZManifestDefaults = () =>
  ({
    required: true,
    nullable: false,
    readonly: false,
  } as const)

export type ZManifestDefaults = ReturnType<typeof getZManifestDefaults>
