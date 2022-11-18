import { z } from 'zod'

export const _IdName = z.object({
  Identificador: z.string(),
  Nome: z.string(),
})

export const State = z.object({
  CodigoIBGE: z.number(),
  Nome: z.string(),
  Sigla: z.string(),
})

export type State = z.infer<typeof State>
