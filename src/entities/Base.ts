import type { AxiosInstance } from 'axios'
import { z } from 'zod'
import type { Route } from '../routes'
import { BimerSchemas } from '../schemas'
import { parseSchema } from '../schemas/base'

export class Entity {
  constructor(
    private readonly _client: AxiosInstance,
    private readonly _path: Route
  ) {}

  protected async get<T extends z.ZodTypeAny>(
    path: `${'/' | '?'}${string}`,
    schema: T
  ): Promise<BimerSchemas.ApiResponse<T>> {
    const { data, ...rest } = await this._client.get<
      BimerSchemas.ApiResponse<T>
    >(`${this._path}${path}`)
    console.log(rest)

    return parseSchema(BimerSchemas.ApiResponse(schema), data)
  }
}
