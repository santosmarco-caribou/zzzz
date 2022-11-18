export interface ZManifest {
  readonly type: string
  readonly title?: string
  readonly summary?: string
  readonly description?: string
  readonly deprecated?: boolean
  readonly required?: boolean
  readonly nullable?: boolean
  readonly readonly?: boolean
}

export interface ZManifestMethods {
  title<T extends string>(title: T): ZManifestMethods
  summary<T extends string>(summary: T): ZManifestMethods
  description<T extends string>(description: T): ZManifestMethods
  deprecated<T extends boolean = true>(value: T): ZManifestMethods
}

export const getZManifestDefaults = () =>
  ({
    required: true,
    nullable: false,
    readonly: false,
  } as const)

export type ZManifestDefaults = ReturnType<typeof getZManifestDefaults>
