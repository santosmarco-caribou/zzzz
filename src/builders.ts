import { F } from 'ts-toolbelt'
import { ZManifest } from './manifest'
import { ZTypeName } from './typeName'
import { merge, readonlyDeep, unionizeHints } from './utils'
import { AnyZ, Z } from './z'

export const ZBuilder = <Output, Input = Output>() =>
  TypeNameBuilder<Output, Input>()

const TypeNameBuilder = <Output, Input>() => {
  const builder = <TypeName extends ZTypeName>(typeName: TypeName) =>
    DefBuilder<Output, Input>()(typeName)

  return { type: builder }
}

const DefBuilder =
  <Output, Input>() =>
  <TypeName extends ZTypeName>(typeName: TypeName) => {
    const builder = <Def extends Record<string, unknown>>(def: Def) =>
      HintBuilder<Output, Input>()(typeName, def)

    return { def: builder }
  }

const HintBuilder =
  <Output, Input>() =>
  <TypeName extends ZTypeName, Def extends Record<string, unknown>>(
    typeName: TypeName,
    def: Def
  ) => {
    const _handleNextStep = <Hint extends string>(hint: Hint) =>
      ManifestBuilder<Output, Input>()(typeName, def, hint)

    const hintBuilder = <Hint extends string>(hint: Hint) =>
      _handleNextStep(hint)

    hintBuilder.union = <
      HintValue extends string,
      Hints extends readonly [HintValue, ...HintValue[]]
    >(
      ...hints: Hints
    ) => _handleNextStep(unionizeHints(hints))

    return { hint: hintBuilder }
  }

const ManifestBuilder =
  <Output, Input>() =>
  <
    TypeName extends ZTypeName,
    Def extends Record<string, unknown>,
    Hint extends string
  >(
    typeName: TypeName,
    def: Def,
    hint: Hint
  ) => {
    const _handleNextStep = <Manifest extends ZManifest>(manifest: Manifest) =>
      BuildFinalizer<Output, Input>()(typeName, def, hint, manifest)

    const manifestBuilder = <Manifest extends ZManifest>(
      manifest: F.Narrow<Manifest>
    ) => _handleNextStep(manifest as Manifest)

    manifestBuilder.inherit = <
      Z extends AnyZ,
      Manifest extends Omit<ZManifest, 'type'>
    >(
      z: Z,
      manifest: F.Narrow<Manifest>
    ) =>
      _handleNextStep({
        ...merge(z.manifest, manifest as Manifest),
        type: z.manifest.type,
      })

    return { manifest: manifestBuilder }
  }

const BuildFinalizer =
  <Output, Input>() =>
  <
    TypeName extends ZTypeName,
    Def extends Record<string, unknown>,
    Hint extends string,
    Manifest extends ZManifest
  >(
    typeName: TypeName,
    def: Def,
    hint: Hint,
    manifest: Manifest
  ) => {
    const builder = () => {
      const config = readonlyDeep({ typeName, def, hint, manifest })
      return Object.assign(new Z<Output, typeof config, Input>(config), def)
    }

    return { build: builder }
  }
