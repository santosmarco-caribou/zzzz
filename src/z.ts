import { ZBuilder } from './builders'
import {
  parseStringDetailedArg,
  type DetailedArg,
  type ZManifest,
} from './manifest'
import type { ZOptions } from './options'
import { ZParsedType, ZTypeName } from './types'
import {
  get,
  map,
  readonlyDeep,
  simplify,
  type ReadonlyDeep,
  type Simplify,
} from './utils'

const _z = Symbol('Z')

export interface ZConfig<Output> {
  readonly typeName: ZTypeName
  readonly options: ZOptions
  readonly def: Record<string, unknown> | null
  readonly hint: string
  readonly manifest: ZManifest<Output>
}

export interface BaseZ<Output, Config extends ZConfig<Output>, Input> {
  readonly $_output: Output
  readonly $_input: Input
  readonly typeName: Config['typeName']
  readonly options: Simplify<ReadonlyDeep<Config['options']>>
  readonly hint: Config['hint']
  readonly manifest: Simplify<ReadonlyDeep<Config['manifest']>>
  readonly [_z]: true
}

export class ZType<Output, Config extends ZConfig<Output>, Input>
  implements BaseZ<Output, Config, Input>
{
  readonly $_output!: Output
  readonly $_input!: Input

  private readonly _typeName: Config['typeName']
  private readonly _options: Config['options']
  private readonly _hint: Config['hint']
  private readonly _manifest: Config['manifest']

  constructor(private readonly _config: Config) {
    const { typeName, options, hint, manifest } = this._config
    this._typeName = typeName
    this._options = options
    this._hint = hint
    this._manifest = manifest
  }

  /* ------------------------------------------------------------------------ */

  get typeName() {
    return this._typeName
  }

  get options() {
    return simplify(readonlyDeep(this._options))
  }

  get hint() {
    return this._hint
  }

  get manifest() {
    return simplify(readonlyDeep(this._manifest))
  }

  /* ------------------------------------------------------------------------ */

  optional() {
    return optionalType(this)
  }

  nullable() {
    return nullableType(this)
  }

  nullish() {
    return nullishType(this)
  }

  promise() {
    return promiseType(this)
  }

  /* -------------------------------- Options ------------------------------- */

  label(label: string) {
    return this._updateOptions('label', label)
  }

  color(color: string) {
    return this._updateOptions('color', color)
  }

  /* ------------------------------- Manifest ------------------------------- */

  title(title: string) {
    return this._updateManifest('title', title)
  }

  summary(summary: string) {
    return this._updateManifest('summary', summary)
  }

  description(description: string) {
    return this._updateManifest('description', description)
  }

  examples(...examples: readonly [Output, ...Output[]]) {
    return this._updateManifest('examples', [
      ...(this._manifest.examples ?? []),
      ...examples,
    ])
  }

  tags(...tags: readonly [DetailedArg<string>, ...DetailedArg<string>[]]) {
    return this._updateManifest('tags', [
      ...(this._manifest.tags ?? []),
      ...map(tags, parseStringDetailedArg),
    ])
  }

  notes(...notes: readonly [DetailedArg<string>, ...DetailedArg<string>[]]) {
    return this._updateManifest('notes', [
      ...(this._manifest.notes ?? []),
      ...map(notes, parseStringDetailedArg),
    ])
  }

  unit(unit: DetailedArg<string>) {
    return this._updateManifest('unit', parseStringDetailedArg(unit))
  }

  deprecated(value = true) {
    return this._updateManifest('deprecated', value)
  }

  /* ------------------------------------------------------------------------ */

  private _updateManifest<Key extends keyof ZManifest<Output>>(
    key: Key,
    value: ZManifest<Output>[Key]
  ) {
    return new ZType<Output, Config, Input>({
      ...this._config,
      manifest: { ...this._manifest, [key]: value },
    })
  }

  private _updateOptions<Key extends keyof ZOptions>(
    key: Key,
    value: ZOptions[Key]
  ) {
    return new ZType<Output, Config, Input>({
      ...this._config,
      options: { ...this._options, [key]: value },
    })
  }

  /* ------------------------------------------------------------------------ */

  readonly [_z] = true
}

export type AnyZType<Output = any, Input = Output> = BaseZ<
  Output,
  ZConfig<Output>,
  Input
>

export type OutputOf<Z extends AnyZType> = Z['$_output']
export type InputOf<Z extends AnyZType> = Z['$_input']

const Z = ZBuilder

/* ---------------------------------- ZAny ---------------------------------- */

const anyType = (options: ZOptions = {}) =>
  Z<any>()
    .type(ZTypeName.Any)
    .options(options)
    .hint(ZParsedType.Any)
    .manifest({ type: ZParsedType.Any, required: false, nullable: true })
    .build()

type ZAny = ReturnType<typeof anyType>

/* -------------------------------- ZUnknown -------------------------------- */

const unknownType = (options: ZOptions = {}) =>
  Z<unknown>()
    .type(ZTypeName.Unknown)
    .options(options)
    .hint(ZParsedType.Unknown)
    .manifest({ type: ZParsedType.Unknown, required: false, nullable: true })
    .build()

type ZUnknown = ReturnType<typeof unknownType>

/* -------------------------------- ZBoolean -------------------------------- */

const booleanType = (options: ZOptions = {}) =>
  Z<boolean>()
    .type(ZTypeName.Boolean)
    .options(options)
    .hint(ZParsedType.Boolean)
    .manifest({ type: ZParsedType.Boolean })
    .build()

type ZBoolean = ReturnType<typeof booleanType>

/* ---------------------------------- ZNaN ---------------------------------- */

const nanType = (options: ZOptions = {}) =>
  Z<number>()
    .type(ZTypeName.NaN)
    .options(options)
    .hint(ZParsedType.NaN)
    .manifest({ type: ZParsedType.NaN })
    .build()

type ZNaN = ReturnType<typeof nanType>

/* -------------------------------- ZPromise -------------------------------- */

const promiseType = <T extends AnyZType>(awaited: T, options: ZOptions = {}) =>
  Z<Promise<OutputOf<T>>, Promise<InputOf<T>>>()
    .type(ZTypeName.Promise)
    .options(options)
    .def({ awaited })
    .hint(`Promise<${get(awaited, 'hint')}>`)
    .manifest({ type: ZParsedType.Promise, awaited: get(awaited, 'manifest') })
    .extend({
      get awaited() {
        return awaited
      },
      unwrap() {
        return awaited
      },
    })

type ZPromise<Z extends AnyZType> = ReturnType<typeof promiseType<Z>>

/* -------------------------------- ZNullable ------------------------------- */

const nullableType = <T extends AnyZType>(
  underlying: T,
  options: ZOptions = {}
) =>
  Z<OutputOf<T> | null, InputOf<T> | null>()
    .type(ZTypeName.Nullable)
    .options(options)
    .def({ underlying })
    .hint.or(get(underlying, 'hint'), ZParsedType.Null)
    .manifest.merge(get(underlying, 'manifest'), { nullable: true })
    .extend({
      get underlying() {
        return underlying
      },
      unwrap() {
        return underlying
      },
    })

type ZNullable<Z extends AnyZType> = ReturnType<typeof nullableType<Z>>

/* -------------------------------- ZOptional ------------------------------- */

const optionalType = <Z extends AnyZType>(
  underlying: Z,
  options: ZOptions = {}
) =>
  Z<OutputOf<Z> | undefined, InputOf<Z> | undefined>()
    .type(ZTypeName.Optional)
    .options(options)
    .def({ underlying })
    .hint.or(get(underlying, 'hint'), ZParsedType.Undefined)
    .manifest.merge(get(underlying, 'manifest'), { required: false })
    .extend({
      get underlying() {
        return underlying
      },
      unwrap() {
        return underlying
      },
    })

type ZOptional<Z extends AnyZType> = ReturnType<typeof optionalType<Z>>

/* -------------------------------- ZNullish -------------------------------- */

const nullishType = <Z extends AnyZType>(
  underlying: Z,
  options: ZOptions = {}
) =>
  Z<OutputOf<Z> | null | undefined, InputOf<Z> | null | undefined>()
    .type(ZTypeName.Nullish)
    .options(options)
    .def({ underlying })
    .hint.or(get(underlying, 'hint'), ZParsedType.Null, ZParsedType.Undefined)
    .manifest.merge(get(underlying, 'manifest'), {
      required: false,
      nullable: true,
    })
    .extend({
      get underlying() {
        return underlying
      },
      unwrap() {
        return underlying
      },
    })

type ZNullish<Z extends AnyZType> = ReturnType<typeof nullishType<Z>>

/* ---------------------------------- ZNull --------------------------------- */

const nullType = (options: ZOptions = {}) =>
  Z<null>()
    .type(ZTypeName.Null)
    .options(options)
    .hint(ZParsedType.Null)
    .manifest({ type: ZParsedType.Null, nullable: true })
    .build()

type ZNull = ReturnType<typeof nullType>

/* ------------------------------- ZUndefined ------------------------------- */

const undefinedType = (options: ZOptions = {}) =>
  Z<undefined>()
    .type(ZTypeName.Undefined)
    .options(options)
    .hint(ZParsedType.Undefined)
    .manifest({ type: ZParsedType.Undefined, required: false })
    .build()

type ZUndefined = ReturnType<typeof undefinedType>

/* ---------------------------------- ZVoid --------------------------------- */

const voidType = (options: ZOptions = {}) =>
  Z<void>()
    .type(ZTypeName.Void)
    .options(options)
    .hint(ZParsedType.Void)
    .manifest({ type: ZParsedType.Void, required: false })
    .build()

type ZVoid = ReturnType<typeof voidType>

/* -------------------------------------------------------------------------- */

export const z = {
  any: anyType,
  boolean: booleanType,
  nan: nanType,
  null: nullType,
  nullable: nullableType,
  nullish: nullishType,
  optional: optionalType,
  promise: promiseType,
  undefined: undefinedType,
  unknown: unknownType,
  void: voidType,

  type: ZTypeName,
}

export namespace z {
  export type output<Z extends AnyZType> = OutputOf<Z>
  export type input<Z extends AnyZType> = InputOf<Z>
  export type infer<Z extends AnyZType> = OutputOf<Z>

  export type Any = ZAny
  export type Boolean = ZBoolean
  export type NaN = ZNaN
  export type Null = ZNull
  export type Nullable<Z extends AnyZType = AnyZType> = ZNullable<Z>
  export type Nullish<Z extends AnyZType = AnyZType> = ZNullish<Z>
  export type Optional<Z extends AnyZType = AnyZType> = ZOptional<Z>
  export type Promise<Z extends AnyZType = AnyZType> = ZPromise<Z>
  export type Undefined = ZUndefined
  export type Unknown = ZUnknown
  export type Void = ZVoid
}
