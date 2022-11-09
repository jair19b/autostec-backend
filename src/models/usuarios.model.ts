import {Entity, model, property, belongsTo, hasMany} from '@loopback/repository';
import {Sedes} from './sedes.model';
import {Vehiculos} from './vehiculos.model';
import {Revisiones} from './revisiones.model';

@model()
export class Usuarios extends Entity {
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
  cedula: string;

  @property({
    type: 'string',
    required: true,
  })
  nombres: string;

  @property({
    type: 'string',
    required: true,
  })
  apellidos: string;

  @property({
    type: 'string',
    required: true,
  })
  telefono: string;

  @property({
    type: 'string',
    required: true,
  })
  fechaNacimiento: string;

  @property({
    type: 'string',
    required: true,
  })
  correo: string;

  @property({
    type: 'string',
    required: true,
  })
  contraseina: string;

  @property({
    type: 'string',
    default: 'cliente',
  })
  rol?: string;

  @property({
    type: 'string',
  })
  nivelEstudios?: string;

  @property({
    type: 'string',
  })
  direccion?: string;

  @property({
    type: 'string',
  })
  ciudadResidencia?: string;

  @belongsTo(() => Sedes)
  sedeId: string;

  @hasMany(() => Vehiculos, {keyTo: 'usuarioId'})
  vehiculos: Vehiculos[];

  @hasMany(() => Revisiones, {keyTo: 'mecanicoId'})
  revisiones: Revisiones[];

  constructor(data?: Partial<Usuarios>) {
    super(data);
  }
}

export interface UsuariosRelations {
  // describe navigational properties here
}

export type UsuariosWithRelations = Usuarios & UsuariosRelations;
