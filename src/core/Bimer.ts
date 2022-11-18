import axios, { AxiosInstance } from 'axios'
import md5 from 'md5'
import qs from 'qs'
import { z } from 'zod'
import { BimerProducts } from '../entities'
import { BimerAgencies } from '../entities/Agencies'
import { routes } from '../routes'

const bimerCredentialsSchema = z.object({
  baseUrl: z.string().url(),
  username: z.string(),
  password: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
})

type BimerCredentials = Readonly<z.infer<typeof bimerCredentialsSchema>>

type BimerAuthTokenResponse = {
  readonly access_token: string
  readonly token_type: string
  readonly expires_in: number
  readonly refresh_token: string
  readonly 'as:client_id': string
  readonly userName: string
  readonly '.issued': string
  readonly '.expires': string
}

type BimerAuthToken = {
  readonly clientId: string
  readonly accessToken: string
  readonly refreshToken: string
  readonly expiresInMs: number
  readonly expiresAt: Date
}

class Bimer {
  private static _instance?: Bimer

  private _credentials: BimerCredentials
  private _token: BimerAuthToken
  private _client: AxiosInstance

  readonly agencies: BimerAgencies
  readonly products: BimerProducts

  private constructor(
    credentials: BimerCredentials,
    authToken: BimerAuthToken,
    client: AxiosInstance
  ) {
    this._credentials = credentials
    this._token = authToken
    this._client = client

    this._configureClient()

    this.agencies = new BimerAgencies(this._client, routes.api.agencias)
    this.products = new BimerProducts(this._client, routes.api.produtos)
  }

  private _configureClient() {
    this._client.defaults.validateStatus = () => true

    this._client.interceptors.request.use(async config => {
      if (this._token.expiresAt < new Date()) {
        await this._refreshToken()
      }

      if (config.headers) {
        config.headers.Authorization = `Bearer ${this._token.accessToken}`
      }

      return config
    })
  }

  private async _refreshToken() {
    const { data: tokenRes } = await this._client.post<BimerAuthTokenResponse>(
      routes.oauth.token,
      qs.stringify({
        grant_type: 'refresh_token',
        client_id: this._credentials.clientId,
        refresh_token: this._token.refreshToken,
      })
    )

    this._token = formatTokenResponse(tokenRes)
  }

  static get(
    credentials: BimerCredentials,
    authToken: BimerAuthToken,
    client: AxiosInstance
  ): Bimer {
    if (!this._instance) {
      this._instance = new Bimer(credentials, authToken, client)
    }

    return this._instance
  }
}

export const bimer = (credentials: BimerCredentials) => {
  const parsedCredentials = bimerCredentialsSchema.parse(credentials)

  const { baseUrl, username, password, clientId, clientSecret } =
    parsedCredentials

  const nonce = (Math.random() * 1_000_000) | 0

  const client = axios.create({
    baseURL: baseUrl,
  })

  return {
    connect: async () => {
      const { data: tokenRes } = await client.post<BimerAuthTokenResponse>(
        routes.oauth.token,
        qs.stringify({
          grant_type: 'password',
          client_id: clientId,
          client_secret: clientSecret,
          nonce,
          username,
          password: md5(username + nonce + password),
        })
      )

      const authToken = formatTokenResponse(tokenRes)

      return Bimer.get(parsedCredentials, authToken, client)
    },
  }
}

const formatTokenResponse = (
  tokenResponse: BimerAuthTokenResponse
): BimerAuthToken => ({
  clientId: tokenResponse['as:client_id'],
  accessToken: tokenResponse.access_token,
  refreshToken: tokenResponse.refresh_token,
  expiresInMs: tokenResponse.expires_in * 1_000,
  expiresAt: new Date(tokenResponse['.expires']),
})
