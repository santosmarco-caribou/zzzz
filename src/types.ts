/* -------------------------------------------------------------------------- */
/*                                  ZTypeName                                 */
/* -------------------------------------------------------------------------- */

export const ZTypeName = {
  Any: 'ZAny',
  Array: 'ZArray',
  BigInt: 'ZBigInt',
  Boolean: 'ZBoolean',
  Brand: 'ZBrand',
  Buffer: 'ZBuffer',
  Constructor: 'ZConstructor',
  Custom: 'ZCustom',
  Date: 'ZDate',
  Default: 'ZDefault',
  DiscriminatedUnion: 'ZDiscriminatedUnion',
  Enum: 'ZEnum',
  False: 'ZFalse',
  Falsy: 'ZFalsy',
  Function: 'ZFunction',
  InstanceOf: 'ZInstanceOf',
  Intersection: 'ZIntersection',
  Lazy: 'ZLazy',
  Literal: 'ZLiteral',
  Map: 'ZMap',
  NaN: 'ZNaN',
  NativeEnum: 'ZNativeEnum',
  Never: 'ZNever',
  NonNullable: 'ZNonNullable',
  Null: 'ZNull',
  Nullable: 'ZNullable',
  Nullish: 'ZNullish',
  Number: 'ZNumber',
  Object: 'ZObject',
  Optional: 'ZOptional',
  Preprocess: 'ZPreprocess',
  Primitive: 'ZPrimitive',
  Promise: 'ZPromise',
  PropertyKey: 'ZPropertyKey',
  Readonly: 'ZReadonly',
  ReadonlyDeep: 'ZReadonlyDeep',
  Record: 'ZRecord',
  Refinement: 'ZRefinement',
  Set: 'ZSet',
  String: 'ZString',
  Symbol: 'ZSymbol',
  Template: 'ZTemplate',
  Transform: 'ZTransform',
  True: 'ZTrue',
  Tuple: 'ZTuple',
  TypedArray: 'ZTypedArray',
  Undefined: 'ZUndefined',
  Union: 'ZUnion',
  Unknown: 'ZUnknown',
  Void: 'ZVoid',
} as const

export type ZTypeName = typeof ZTypeName[keyof typeof ZTypeName]

/* ------------------------------- ZParsedType ------------------------------ */

export const ZParsedType = {
  Any: 'any',
  Boolean: 'boolean',
  NaN: 'NaN',
  Null: 'null',
  Promise: 'Promise',
  Undefined: 'undefined',
  Unknown: 'unknown',
  Void: 'void',
} as const

export type ZParsedType = typeof ZParsedType[keyof typeof ZParsedType]
