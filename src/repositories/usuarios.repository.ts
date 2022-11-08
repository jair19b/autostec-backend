import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Usuarios, UsuariosRelations, Sedes} from '../models';
import {SedesRepository} from './sedes.repository';

export class UsuariosRepository extends DefaultCrudRepository<
  Usuarios,
  typeof Usuarios.prototype.id,
  UsuariosRelations
> {

  public readonly sede: BelongsToAccessor<Sedes, typeof Usuarios.prototype.id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('SedesRepository') protected sedesRepositoryGetter: Getter<SedesRepository>,
  ) {
    super(Usuarios, dataSource);
    this.sede = this.createBelongsToAccessorFor('sede', sedesRepositoryGetter,);
    this.registerInclusionResolver('sede', this.sede.inclusionResolver);
  }
}
