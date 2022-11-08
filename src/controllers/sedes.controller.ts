import {Count, CountSchema, Filter, FilterExcludingWhere, repository, Where} from '@loopback/repository';
import {del, get, getModelSchemaRef, getWhereSchemaFor, HttpErrors, param, patch, post, put, requestBody, response} from '@loopback/rest';
import {Sedes} from '../models';
import {SedesRepository} from '../repositories';
import {SedesServices, UsuariosServices} from '../services';
import {Usuarios} from './../models/usuarios.model';
import {UsuariosRepository} from './../repositories/usuarios.repository';

export class SedesController {
  private sedesServices: SedesServices;
  private userServices: UsuariosServices;

  constructor(
    @repository(SedesRepository)
    public sedesRepository: SedesRepository,
    @repository(UsuariosRepository)
    public usuarioRepository: UsuariosRepository
  ) {
    this.sedesServices = new SedesServices(sedesRepository);
    this.userServices = new UsuariosServices(usuarioRepository);
  }

  @post('/sedes/create')
  @response(200, {
    description: 'Sedes model instance',
    content: {'application/json': {schema: getModelSchemaRef(Sedes)}}
  })
  async create(
    @requestBody({content: {'application/json': {schema: getModelSchemaRef(Sedes, {exclude: ['id']})}}})
    sedes: Omit<Sedes, 'id'>
  ): Promise<Sedes> {
    return this.sedesRepository.create(sedes);
  }

  @get('/sedes/count')
  @response(200, {
    description: 'Sedes model count',
    content: {'application/json': {schema: CountSchema}}
  })
  async count(@param.where(Sedes) where?: Where<Sedes>): Promise<Count> {
    return this.sedesRepository.count(where);
  }

  @get('/sedes/get-all')
  @response(200, {
    description: 'Array of Sedes model instances',
    content: {'application/json': {schema: {type: 'array', items: getModelSchemaRef(Sedes, {includeRelations: true})}}}
  })
  async find(@param.filter(Sedes) filter?: Filter<Sedes>): Promise<Sedes[]> {
    return this.sedesRepository.find(filter);
  }

  @patch('/sedes/update')
  @response(200, {
    description: 'Sedes PATCH success count',
    content: {'application/json': {schema: CountSchema}}
  })
  async updateAll(
    @requestBody({content: {'application/json': {schema: getModelSchemaRef(Sedes, {partial: true})}}})
    sedes: Sedes,
    @param.where(Sedes) where?: Where<Sedes>
  ): Promise<Count> {
    return this.sedesRepository.updateAll(sedes, where);
  }

  @get('/sedes/{id}')
  @response(200, {
    description: 'Sedes model instance',
    content: {'application/json': {schema: getModelSchemaRef(Sedes, {includeRelations: true})}}
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Sedes, {exclude: 'where'}) filter?: FilterExcludingWhere<Sedes>
  ): Promise<Sedes> {
    const sede = await this.sedesServices.validarExistenciaSede(id, filter);
    return sede;
  }

  @patch('/sedes/{id}')
  @response(204, {
    description: 'Sedes PATCH success'
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({content: {'application/json': {schema: getModelSchemaRef(Sedes, {partial: true})}}})
    sedes: Sedes
  ): Promise<void> {
    try {
      await this.sedesRepository.updateById(id, sedes);
    } catch (error) {
      throw new HttpErrors[400]('La sede no existe');
    }
  }

  @put('/sedes/{id}')
  @response(204, {
    description: 'Sedes PUT success'
  })
  async replaceById(@param.path.string('id') id: string, @requestBody() sedes: Sedes): Promise<void> {
    try {
      await this.sedesRepository.replaceById(id, sedes);
    } catch (error) {
      throw new HttpErrors[400]('La sede no existe');
    }
  }

  @del('/sedes/{id}')
  @response(204, {
    description: 'Sedes DELETE success'
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.sedesRepository.deleteById(id);
  }

  @get('/sedes/{id}/usuarios')
  @response(200, {
    description: 'Array of Sedes has many Usuarios',
    content: {'application/json': {schema: {type: 'array', items: getModelSchemaRef(Usuarios)}}}
  })
  async findSedeUser(@param.path.string('id') id: string, @param.query.object('filter') filter?: Filter<Usuarios>): Promise<Usuarios[]> {
    return this.sedesRepository.usuarios(id).find(filter);
  }

  @post('/sedes/{id}/usuarios')
  @response(200, {
    description: 'Sedes model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuarios)}}
  })
  async createSedeUser(
    @param.path.string('id') id: typeof Sedes.prototype.id,
    @requestBody({
      content: {'application/json': {schema: getModelSchemaRef(Usuarios, {title: 'NewUsuariosInSedes', exclude: ['id', 'sedeId']})}}
    })
    usuarios: Omit<Usuarios, 'id'>
  ): Promise<Usuarios> {
    this.userServices.validarCamposUsuario(usuarios);
    await this.sedesServices.validarExistenciaSede(id);
    await this.userServices.validarInexistenciaUsuario(usuarios.correo, usuarios.cedula);
    return this.sedesRepository.usuarios(id).create({...usuarios, rol: 'cliente'});
  }

  @patch('/sedes/{id}/usuarios', {
    responses: {
      '200': {
        description: 'Sedes.Usuarios PATCH success count',
        content: {'application/json': {schema: CountSchema}}
      }
    }
  })
  async patchUserInSedes(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuarios, {partial: true})
        }
      }
    })
    usuarios: Partial<Usuarios>,
    @param.query.object('where', getWhereSchemaFor(Usuarios)) where?: Where<Usuarios>
  ): Promise<Count> {
    this.userServices.protegerCredenciales(usuarios);
    await this.sedesServices.validarExistenciaSede(id);
    return this.sedesRepository.usuarios(id).patch(usuarios, where);
  }

  /*
  @del('/sedes/{id}/usuarios', {
    responses: {
      '200': {
        description: 'Sedes.Usuarios DELETE success count',
        content: {'application/json': {schema: CountSchema}}
      }
    }
  })
  async deleteUserInSede(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Usuarios)) where?: Where<Usuarios>
  ): Promise<Count> {
    await this.sedesServices.validarExistenciaSede(id);
    return this.sedesRepository.usuarios(id).delete(where);
  } */
}
