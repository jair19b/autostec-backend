import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Sedes, SedesRelations, Usuarios} from '../models';
import {UsuariosRepository} from './usuarios.repository';

export class SedesRepository extends DefaultCrudRepository<
  Sedes,
  typeof Sedes.prototype.id,
  SedesRelations
> {

  public readonly usuarios: HasManyRepositoryFactory<Usuarios, typeof Sedes.prototype.id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('UsuariosRepository') protected usuariosRepositoryGetter: Getter<UsuariosRepository>,
  ) {
    super(Sedes, dataSource);
    this.usuarios = this.createHasManyRepositoryFactoryFor('usuarios', usuariosRepositoryGetter,);
    this.registerInclusionResolver('usuarios', this.usuarios.inclusionResolver);
  }
}
