import {Entity, model, property} from '@loopback/repository';

@model()
export class Sedes extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  nombre: string;

  @property({
    type: 'string',
    required: true,
  })
  direccion: string;

  @property({
    type: 'string',
    required: true,
  })
  ciudad: string;

  constructor(data?: Partial<Sedes>) {
    super(data);
  }
}

export interface SedesRelations {
  // describe navigational properties here
}

export type SedesWithRelations = Sedes & SedesRelations;
