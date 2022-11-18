export const ZTypeName = {
  Any: 'ZAny',
  Nullable: 'ZNullable',
  Optional: 'ZOptional',
  Void: 'ZVoid',
} as const

export type ZTypeName = typeof ZTypeName[keyof typeof ZTypeName]
