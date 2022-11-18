import { BimerSchemas } from '../schemas'
import { Entity } from './Base'

export class BimerProducts extends Entity {
  getByCode(codigo: string) {
    return this.get(`?codigo=${codigo}`, BimerSchemas.Agency)
  }
}
