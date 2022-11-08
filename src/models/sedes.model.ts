import {Entity, model, property, hasMany} from '@loopback/repository';
import {Usuarios} from './usuarios.model';

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

  @hasMany(() => Usuarios, {keyTo: 'sedeId'})
  usuarios: Usuarios[];

  constructor(data?: Partial<Sedes>) {
    super(data);
  }
}

export interface SedesRelations {
  // describe navigational properties here
}

export type SedesWithRelations = Sedes & SedesRelations;
