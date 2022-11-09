import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor, HasManyRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Usuarios, UsuariosRelations, Sedes, Vehiculos, Revisiones} from '../models';
import {SedesRepository} from './sedes.repository';
import {VehiculosRepository} from './vehiculos.repository';
import {RevisionesRepository} from './revisiones.repository';

export class UsuariosRepository extends DefaultCrudRepository<
  Usuarios,
  typeof Usuarios.prototype.id,
  UsuariosRelations
> {

  public readonly sede: BelongsToAccessor<Sedes, typeof Usuarios.prototype.id>;

  public readonly vehiculos: HasManyRepositoryFactory<Vehiculos, typeof Usuarios.prototype.id>;

  public readonly revisiones: HasManyRepositoryFactory<Revisiones, typeof Usuarios.prototype.id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('SedesRepository') protected sedesRepositoryGetter: Getter<SedesRepository>, @repository.getter('VehiculosRepository') protected vehiculosRepositoryGetter: Getter<VehiculosRepository>, @repository.getter('RevisionesRepository') protected revisionesRepositoryGetter: Getter<RevisionesRepository>,
  ) {
    super(Usuarios, dataSource);
    this.revisiones = this.createHasManyRepositoryFactoryFor('revisiones', revisionesRepositoryGetter,);
    this.registerInclusionResolver('revisiones', this.revisiones.inclusionResolver);
    this.vehiculos = this.createHasManyRepositoryFactoryFor('vehiculos', vehiculosRepositoryGetter,);
    this.registerInclusionResolver('vehiculos', this.vehiculos.inclusionResolver);
    this.sede = this.createBelongsToAccessorFor('sede', sedesRepositoryGetter,);
    this.registerInclusionResolver('sede', this.sede.inclusionResolver);
  }
}
