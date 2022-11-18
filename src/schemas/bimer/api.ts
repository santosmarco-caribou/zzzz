import { z } from 'zod'

export const ApiResponse = <T extends z.ZodTypeAny>(resultSchema: T) =>
  z.object({
    Erros: z
      .object({
        ErrorCode: z.string(),
        ErrorMessage: z.string(),
        PossibleCause: z.string(),
        StackTrace: z.string(),
      })
      .array(),

    ListaObjetos: resultSchema.array(),
  })

type _ApiResponse<T extends z.ZodTypeAny> = typeof ApiResponse<T>

export type ApiResponse<T extends z.ZodTypeAny> = z.infer<
  ReturnType<_ApiResponse<T>>
>
