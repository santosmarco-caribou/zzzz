import type { F } from 'ts-toolbelt'
import {
  getZManifestDefaults,
  type AnyZManifest,
  type ZManifest,
} from './manifest'
import { concat, head, join, merge, split, tail, unique } from './utils'
import { ZType, type ZConfig } from './z'

export const ZBuilder = <Output, Input = Output>() =>
  TypeNameBuilder<Output, Input>()

const TypeNameBuilder = <Output, Input>() => {
  return {
    type: <TypeName extends ZConfig<Output>['typeName']>(typeName: TypeName) =>
      OptionsBuilder<Output, Input>()(typeName),
  }
}

const OptionsBuilder =
  <Output, Input>() =>
  <TypeName extends ZConfig<Output>['typeName']>(typeName: TypeName) => {
    return {
      options: <Opts extends ZConfig<Output>['options']>(
        options: F.Narrow<Opts>
      ) => DefBuilder<Output, Input>()(typeName, options as Opts),
    }
  }

const DefBuilder =
  <Output, Input>() =>
  <
    TypeName extends ZConfig<Output>['typeName'],
    Opts extends ZConfig<Output>['options']
  >(
    typeName: TypeName,
    options: Opts
  ) => {
    return {
      def: <Def extends NonNullable<ZConfig<Output>['def']>>(def: Def) =>
        HintBuilder<Output, Input>()(typeName, options, def),

      ...HintBuilder<Output, Input>()(typeName, options, null),
    }
  }

const HintBuilder =
  <Output, Input>() =>
  <
    TypeName extends ZConfig<Output>['typeName'],
    Opts extends ZConfig<Output>['options'],
    Def extends ZConfig<Output>['def']
  >(
    typeName: TypeName,
    options: Opts,
    def: Def
  ) => {
    const nextStep = <Hint extends ZConfig<Output>['hint']>(hint: Hint) =>
      ManifestBuilder<Output, Input>()(typeName, options, def, hint)

    const builder = <Hint extends string>(hint: Hint) => nextStep(hint)

    builder.or = <
      HintValue extends string,
      Hints extends readonly [HintValue, ...HintValue[]]
    >(
      ...hints: Hints
    ) => {
      const deunionizedHead = split(head(hints), ' | ')
      const uniqueHints = unique(concat(deunionizedHead, tail(hints)))
      return nextStep(join(uniqueHints, ' | '))
    }

    return { hint: builder }
  }

const ManifestBuilder =
  <Output, Input>() =>
  <
    TypeName extends ZConfig<Output>['typeName'],
    Opts extends ZConfig<Output>['options'],
    Def extends ZConfig<Output>['def'],
    Hint extends ZConfig<Output>['hint']
  >(
    typeName: TypeName,
    options: Opts,
    def: Def,
    hint: Hint
  ) => {
    const nextStep = <Manifest extends ZManifest<Output>>(manifest: Manifest) =>
      BuildFinalizer<Output, Input>()(typeName, options, def, hint, manifest)

    const builder = <Manifest extends ZManifest<Output>>(
      manifest: F.Narrow<Manifest>
    ) => nextStep(manifest as Manifest)

    builder.merge = <
      Inherited extends AnyZManifest,
      Manifest extends Omit<ZManifest<Output>, 'type'>
    >(
      inherited: Inherited,
      manifest: F.Narrow<Manifest>
    ) =>
      nextStep({
        ...merge(inherited, manifest as Manifest),
        type: inherited.type,
      })

    return { manifest: builder }
  }

const BuildFinalizer =
  <Output, Input>() =>
  <
    TypeName extends ZConfig<Output>['typeName'],
    Opts extends ZConfig<Output>['options'],
    Def extends ZConfig<Output>['def'],
    Hint extends ZConfig<Output>['hint'],
    Manifest extends ZConfig<Output>['manifest']
  >(
    typeName: TypeName,
    options: Opts,
    def: Def,
    hint: Hint,
    manifest: Manifest
  ) => {
    const config = {
      typeName,
      options,
      def,
      hint,
      manifest: merge(
        merge({} as ZManifest<Output>, getZManifestDefaults()),
        manifest
      ),
    }

    type Config = typeof config

    const schema = new ZType<Output, Config, Input>(config)

    return {
      build: () => schema,

      extend: <Extension extends Record<string, unknown>>(
        extension:
          | ((data: {
              config: Config
              schema: ZType<Output, Config, Input>
            }) => Extension & ThisType<ZType<Output, Config, Input>>)
          | (Extension & ThisType<ZType<Output, Config, Input>>)
      ) =>
        Object.assign(
          schema,
          typeof extension === 'function'
            ? extension({ config, schema })
            : extension
        ),
    }
  }
