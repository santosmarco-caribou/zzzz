import { ZBuilder } from './builders'
import { getZManifestDefaults, ZManifest, ZManifestMethods } from './manifest'
import { ZTypeName } from './typeName'
import {
  merge,
  readonlyDeep,
  simplify,
  type Merge,
  type ReadonlyDeep,
  type Simplify,
} from './utils'

const _z = Symbol('Z')

export interface ZConfig {
  readonly typeName: ZTypeName
  readonly def: Record<string, unknown>
  readonly hint: string
  readonly manifest: ZManifest
}

export interface BaseZ<Output, Config extends ZConfig, Input> {
  readonly $_output: Output
  readonly $_input: Input
  readonly typeName: Config['typeName']
  readonly hint: Config['hint']
  readonly manifest: Config['manifest']
  readonly [_z]: true
}

type UpdateManifest<
  Config extends ZConfig,
  Key extends keyof ZManifest,
  Value extends ZManifest[Key]
> = Simplify<
  ReadonlyDeep<
    Merge<
      Config,
      {
        manifest: Merge<
          Config['manifest'],
          { [K in Key]: Value } & { type: Config['manifest']['type'] }
        >
      }
    >
  >
>

export class Z<Output, Config extends ZConfig, Input>
  implements BaseZ<Output, Config, Input>, ZManifestMethods
{
  readonly $_output!: Output
  readonly $_input!: Input

  private readonly _typeName: Config['typeName']
  private readonly _hint: Config['hint']
  private readonly _manifest: Config['manifest']

  constructor(private readonly _config: Config) {
    const { typeName, hint, manifest } = this._config
    this._typeName = typeName
    this._hint = hint
    this._manifest = manifest
  }

  get typeName() {
    return this._typeName
  }

  get hint() {
    return this._hint
  }

  get manifest() {
    return simplify(merge(getZManifestDefaults(), this._manifest))
  }

  optional() {
    return zoptional(this)
  }

  nullable() {
    return znullable(this)
  }

  nullish() {
    return this.optional().nullable()
  }

  title<T extends string>(title: T) {
    return this._updateManifest('title', title)
  }

  summary<T extends string>(summary: T) {
    return this._updateManifest('summary', summary)
  }

  description<T extends string>(description: T) {
    return this._updateManifest('description', description)
  }

  deprecated<T extends boolean = true>(value: T = true as T) {
    return this._updateManifest('deprecated', value)
  }

  private _updateManifest<
    Key extends keyof ZManifest,
    Value extends ZManifest[Key]
  >(
    key: Key,
    value: Value
  ): Z<Output, UpdateManifest<Config, Key, Value>, Input> {
    return new Z<Output, UpdateManifest<Config, Key, Value>, Input>(
      simplify(
        readonlyDeep(
          merge(this._config, {
            manifest: merge(this._manifest, {
              ...({ [key]: value } as { [K in Key]: Value }),
              type: this._manifest.type,
            }),
          })
        )
      )
    )
  }

  readonly [_z] = true

  static readonly extend = ZBuilder
}

export type AnyZ = BaseZ<unknown, ZConfig, unknown>
export type OutputOf<Z extends AnyZ> = Z['$_output']
export type InputOf<Z extends AnyZ> = Z['$_input']

/* ---------------------------------- ZAny ---------------------------------- */

const zany = () =>
  Z.extend<any>()
    .type(ZTypeName.Any)
    .def({})
    .hint('any')
    .manifest({ type: 'any', required: false })
    .build()

type ZAny = ReturnType<typeof zany>

/* -------------------------------- ZNullable ------------------------------- */

const znullable = <Z extends AnyZ>(underlying: Z) =>
  Z.extend<OutputOf<Z> | null, InputOf<Z> | null>()
    .type(ZTypeName.Nullable)
    .def({ underlying })
    .hint.union(underlying.hint, 'null')
    .manifest.inherit(underlying, { nullable: true })
    .build()

type ZNullable<Z extends AnyZ> = ReturnType<typeof znullable<Z>>

/* -------------------------------- ZOptional ------------------------------- */

const zoptional = <Z extends AnyZ>(underlying: Z) =>
  Z.extend<OutputOf<Z> | undefined, InputOf<Z> | undefined>()
    .type(ZTypeName.Optional)
    .def({ underlying })
    .hint.union(underlying.hint, 'undefined')
    .manifest.inherit(underlying, { required: false })
    .build()

type ZOptional<Z extends AnyZ> = ReturnType<typeof zoptional<Z>>

/* ---------------------------------- ZVoid --------------------------------- */

const zvoid = () =>
  Z.extend<void>()
    .type(ZTypeName.Void)
    .def({})
    .hint('void')
    .manifest({ type: 'void', required: false })
    .build()

type ZVoid = ReturnType<typeof zvoid>

/* -------------------------------------------------------------------------- */

export const z = {
  any: zany,
  nullable: znullable,
  optional: zoptional,
  void: zvoid,
}

export namespace z {
  export type output<Z extends AnyZ> = OutputOf<Z>
  export type input<Z extends AnyZ> = InputOf<Z>
  export type infer<Z extends AnyZ> = OutputOf<Z>

  export type Any = ZAny
  export type Nullable<Z extends AnyZ = AnyZ> = ZNullable<Z>
  export type Optional<Z extends AnyZ = AnyZ> = ZOptional<Z>
  export type Void = ZVoid
}
