import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'

export const parseSchema = <T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> => {
  try {
    return schema.parse(data)
  } catch (err) {
    const formatted = fromZodError(err as z.ZodError<z.input<T>>)
    throw formatted
  }
}
