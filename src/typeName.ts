/* -------------------------------------------------------------------------- */
/*                                  ZTypeName                                 */
/* -------------------------------------------------------------------------- */

export const ZTypeName = {
  Any: 'ZAny',
  Null: 'ZNull',
  Nullable: 'ZNullable',
  Nullish: 'ZNullish',
  Optional: 'ZOptional',
  Undefined: 'ZUndefined',
  Unknown: 'ZUnknown',
  Void: 'ZVoid',
} as const

export type ZTypeName = typeof ZTypeName[keyof typeof ZTypeName]

/* ------------------------------- ZParsedType ------------------------------ */

export const ZParsedType = {
  Any: 'any',
  Unknown: 'unknown',
  Null: 'null',
  Undefined: 'undefined',
  Void: 'void',
} as const

export type ZParsedType = typeof ZParsedType[keyof typeof ZParsedType]
