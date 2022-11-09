import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Vehiculos} from './vehiculos.model';
import {Usuarios} from './usuarios.model';

@model()
export class Revisiones extends Entity {
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
  placa: string;

  @property({
    type: 'string',
    default: 'pendiente',
  })
  estadoRevision?: string;

  @property({
    type: 'string',
    required: true,
  })
  estadoVehiculo: string;

  @property({
    type: 'string',
    required: true,
  })
  fechaRevision: string;

  @property({
    type: 'string',
  })
  horaEntrada?: string;

  @property({
    type: 'string',
  })
  horaSalida?: string;

  @belongsTo(() => Vehiculos)
  vehiculoId: string;

  @belongsTo(() => Usuarios)
  mecanicoId: string;

  constructor(data?: Partial<Revisiones>) {
    super(data);
  }
}

export interface RevisionesRelations {
  // describe navigational properties here
}

export type RevisionesWithRelations = Revisiones & RevisionesRelations;
