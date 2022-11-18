import { BimerSchemas } from '../schemas'
import { Entity } from './Base'

export class BimerAgencies extends Entity {
  getById(id: string) {
    return this.get(`/${id}`, BimerSchemas.Agency)
  }
}
