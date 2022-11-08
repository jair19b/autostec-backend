import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Usuarios} from './usuarios.model';

@model()
export class Vehiculos extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true
  })
  id?: string;

  @property({
    type: 'string',
    required: true
  })
  placa: string;

  @property({
    type: 'string',
    required: true
  })
  tipoVehiculo: string;

  @property({
    type: 'string',
    required: true
  })
  marca: string;

  @property({
    type: 'string',
    required: true
  })
  anio: string;

  @property({
    type: 'string',
    required: true
  })
  modelo: string;

  @property({
    type: 'string',
    required: true
  })
  capacidadPasajeros: string;

  @property({
    type: 'string',
    required: true
  })
  cilindraje: string;

  @property({
    type: 'string',
    required: true
  })
  paisOrigen: string;

  @property({
    type: 'string',
    required: true
  })
  descripcion: string;

  @belongsTo(() => Usuarios)
  usuarioId: string;

  constructor(data?: Partial<Vehiculos>) {
    super(data);
  }
}

export interface VehiculosRelations {
  // describe navigational properties here
}

export type VehiculosWithRelations = Vehiculos & VehiculosRelations;
