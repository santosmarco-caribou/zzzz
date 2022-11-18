import { TraverseFor } from './types'

export const routes = {
  oauth: {
    token: '/oauth/token',
  },
  api: {
    agencias: '/api/agencias',
    produtos: '/api/produtos',
  },
} as const

export type Route = TraverseFor<typeof routes, string>
