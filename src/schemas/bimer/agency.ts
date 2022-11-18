import { z } from 'zod'
import { _IdName, State } from './common'

export const Bank = _IdName

export type Bank = z.infer<typeof Bank>

export const Agency = z.object({
  Banco: Bank,
  CNPJ: z.number(),
  CodigoChamada: z.number(),
  Nome: z.string(),
  NomePraca: z.string(),
  Numero: z.string(),
  UF: State,
})

export type Agency = z.infer<typeof Agency>
