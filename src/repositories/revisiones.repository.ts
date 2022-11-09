import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Revisiones, RevisionesRelations, Vehiculos, Usuarios} from '../models';
import {VehiculosRepository} from './vehiculos.repository';
import {UsuariosRepository} from './usuarios.repository';

export class RevisionesRepository extends DefaultCrudRepository<
  Revisiones,
  typeof Revisiones.prototype.id,
  RevisionesRelations
> {

  public readonly vehiculo: BelongsToAccessor<Vehiculos, typeof Revisiones.prototype.id>;

  public readonly mecanico: BelongsToAccessor<Usuarios, typeof Revisiones.prototype.id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('VehiculosRepository') protected vehiculosRepositoryGetter: Getter<VehiculosRepository>, @repository.getter('UsuariosRepository') protected usuariosRepositoryGetter: Getter<UsuariosRepository>,
  ) {
    super(Revisiones, dataSource);
    this.mecanico = this.createBelongsToAccessorFor('mecanico', usuariosRepositoryGetter,);
    this.registerInclusionResolver('mecanico', this.mecanico.inclusionResolver);
    this.vehiculo = this.createBelongsToAccessorFor('vehiculo', vehiculosRepositoryGetter,);
    this.registerInclusionResolver('vehiculo', this.vehiculo.inclusionResolver);
  }
}
