export type TraverseFor<
  Source extends Record<PropertyKey, unknown>,
  TargetType
> = {
  [K in keyof Source as Source[K] extends
    | TargetType
    | Record<PropertyKey, unknown>
    ? K
    : never]: Source[K] extends Record<PropertyKey, unknown>
    ? TraverseFor<Source[K], TargetType>
    : Source[K]
} extends infer X
  ? { [K in keyof X]: X[K] }[keyof X]
  : never
