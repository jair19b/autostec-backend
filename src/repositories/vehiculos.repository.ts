import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor, HasManyRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Vehiculos, VehiculosRelations, Usuarios, Revisiones} from '../models';
import {UsuariosRepository} from './usuarios.repository';
import {RevisionesRepository} from './revisiones.repository';

export class VehiculosRepository extends DefaultCrudRepository<
  Vehiculos,
  typeof Vehiculos.prototype.id,
  VehiculosRelations
> {

  public readonly usuario: BelongsToAccessor<Usuarios, typeof Vehiculos.prototype.id>;

  public readonly revisiones: HasManyRepositoryFactory<Revisiones, typeof Vehiculos.prototype.id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('UsuariosRepository') protected usuariosRepositoryGetter: Getter<UsuariosRepository>, @repository.getter('RevisionesRepository') protected revisionesRepositoryGetter: Getter<RevisionesRepository>,
  ) {
    super(Vehiculos, dataSource);
    this.revisiones = this.createHasManyRepositoryFactoryFor('revisiones', revisionesRepositoryGetter,);
    this.registerInclusionResolver('revisiones', this.revisiones.inclusionResolver);
    this.usuario = this.createBelongsToAccessorFor('usuario', usuariosRepositoryGetter,);
    this.registerInclusionResolver('usuario', this.usuario.inclusionResolver);
  }
}
