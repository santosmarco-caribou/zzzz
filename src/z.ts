import { ZBuilder } from './builders'
import { DetailedArg, parseStringDetailedArg, ZManifest } from './manifest'
import { ZOptions, ZOptionsMethods } from './options'
import { ZParsedType, ZTypeName } from './typeName'
import {
  get,
  map,
  ReadonlyDeep,
  readonlyDeep,
  Simplify,
  simplify,
} from './utils'

const _z = Symbol('Z')

export interface ZConfig<Output> {
  readonly typeName: ZTypeName
  readonly def: Record<string, unknown> | null
  readonly hint: string
  readonly options: ZOptions
  readonly manifest: ZManifest<Output>
}

export interface BaseZ<Output, Config extends ZConfig<Output>, Input> {
  readonly $_output: Output
  readonly $_input: Input
  readonly typeName: Config['typeName']
  readonly hint: Config['hint']
  readonly options: Simplify<ReadonlyDeep<Config['options']>>
  readonly manifest: Simplify<ReadonlyDeep<Config['manifest']>>
  readonly [_z]: true
}

export class ZType<Output, Config extends ZConfig<Output>, Input>
  implements BaseZ<Output, Config, Input>, ZOptionsMethods
{
  readonly $_output!: Output
  readonly $_input!: Input

  private readonly _typeName: Config['typeName']
  private readonly _hint: Config['hint']
  private readonly _options: Config['options']
  private readonly _manifest: Config['manifest']

  constructor(private readonly _config: Config) {
    const { typeName, hint, options, manifest } = this._config
    this._typeName = typeName
    this._hint = hint
    this._options = options
    this._manifest = manifest
  }

  /* ------------------------------------------------------------------------ */

  get typeName() {
    return this._typeName
  }

  get hint() {
    return this._hint
  }

  get options() {
    return simplify(readonlyDeep(this._options))
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

/* -------------------------------- ZNullable ------------------------------- */

const nullableType = <Z extends AnyZType>(
  underlying: Z,
  options: ZOptions = {}
) =>
  Z<OutputOf<Z> | null, InputOf<Z> | null>()
    .type(ZTypeName.Nullable)
    .options(options)
    .def({ underlying })
    .hint.or(get(underlying, 'hint'), ZParsedType.Null)
    .manifest.merge(get(underlying, 'manifest'), { nullable: true })
    .build()

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
    .build()

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
    .build()

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
  null: nullType,
  nullable: nullableType,
  nullish: nullishType,
  optional: optionalType,
  undefined: undefinedType,
  unknown: unknownType,
  void: voidType,
}

export namespace z {
  export type output<Z extends AnyZType> = OutputOf<Z>
  export type input<Z extends AnyZType> = InputOf<Z>
  export type infer<Z extends AnyZType> = OutputOf<Z>

  export type Any = ZAny
  export type Null = ZNull
  export type Nullable<Z extends AnyZType = AnyZType> = ZNullable<Z>
  export type Nullish<Z extends AnyZType = AnyZType> = ZNullish<Z>
  export type Optional<Z extends AnyZType = AnyZType> = ZOptional<Z>
  export type Undefined = ZUndefined
  export type Unknown = ZUnknown
  export type Void = ZVoid
}
