import {Count, CountSchema, Filter, FilterExcludingWhere, repository, Where} from '@loopback/repository';
import {del, get, getModelSchemaRef, getWhereSchemaFor, HttpErrors, param, patch, post, put, requestBody, response} from '@loopback/rest';
import {Usuarios, Vehiculos} from '../models';
import {SedesRepository, UsuariosRepository, VehiculosRepository} from '../repositories';
import {SedesServices, UsuariosServices, VehiculosServices} from '../services';

export class ClienteController {
  protected userServices: UsuariosServices;
  protected sedeServices: SedesServices;
  protected vehiculoServices: VehiculosServices;

  constructor(
    @repository(UsuariosRepository)
    public usuariosRepository: UsuariosRepository,
    @repository(SedesRepository)
    public sedesRepository: SedesRepository,
    @repository(VehiculosRepository)
    public vehiculosRepository: VehiculosRepository
  ) {
    this.userServices = new UsuariosServices(usuariosRepository);
    this.sedeServices = new SedesServices(sedesRepository);
  }

  @post('/clientes/crear')
  @response(200, {
    description: 'Usuarios model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuarios)}}
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuarios, {
            title: 'NewUsuarios',
            exclude: ['id', 'rol'],
            optional: ['rol']
          })
        }
      }
    })
    usuarios: Omit<Usuarios, 'id'>
  ): Promise<Usuarios> {
    this.userServices.validarCamposUsuario(usuarios);
    await this.sedeServices.validarExistenciaSede(usuarios.sedeId);
    await this.userServices.validarInexistenciaUsuario(usuarios.correo, usuarios.cedula);
    return this.usuariosRepository.create({...usuarios, rol: 'cliente'});
  }

  @get('/clientes/count')
  @response(200, {
    description: 'Usuarios model count',
    content: {'application/json': {schema: CountSchema}}
  })
  async count(@param.where(Usuarios) where?: Where<Usuarios>): Promise<Count> {
    return this.usuariosRepository.count(where);
  }

  @get('/clientes')
  @response(200, {
    description: 'Array of Usuarios model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Usuarios, {includeRelations: true})
        }
      }
    }
  })
  async find(@param.filter(Usuarios) filter?: Filter<Usuarios>): Promise<Usuarios[]> {
    return this.usuariosRepository.find(filter);
  }

  @patch('/clientes')
  @response(200, {
    description: 'Usuarios PATCH success count',
    content: {'application/json': {schema: CountSchema}}
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuarios, {partial: true, exclude: ['cedula', 'correo', 'contraseina', 'rol']})
        }
      }
    })
    usuarios: Usuarios,
    @param.where(Usuarios) where?: Where<Usuarios>
  ): Promise<Count> {
    this.userServices.protegerCredenciales(usuarios);
    return this.usuariosRepository.updateAll(usuarios, where);
  }

  @get('/clientes/{id}')
  @response(200, {
    description: 'Usuarios model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuarios, {includeRelations: true})
      }
    }
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Usuarios, {exclude: 'where'}) filter?: FilterExcludingWhere<Usuarios>
  ): Promise<Usuarios> {
    try {
      return this.usuariosRepository.findById(id, filter);
    } catch (error) {
      throw new HttpErrors[400]('El susuario no existe');
    }
  }

  @patch('/clientes/{id}')
  @response(204, {
    description: 'Usuarios PATCH success'
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuarios, {
            partial: true,
            exclude: ['id', 'cedula', 'correo', 'contraseina', 'rol', 'sedeId', 'nivelEstudios']
          })
        }
      }
    })
    usuarios: Usuarios
  ): Promise<void> {
    await this.userServices.validateUpdateSecure(id, usuarios);
    try {
      await this.usuariosRepository.updateById(id, {...usuarios, rol: 'cliente'});
    } catch (error) {
      throw new HttpErrors[400]('El susuario no existe');
    }
  }

  @put('/clientes/{id}')
  @response(204, {
    description: 'Usuarios PUT success'
  })
  async replaceById(@param.path.string('id') id: string, @requestBody() usuarios: Omit<Usuarios, 'id'>): Promise<void> {
    this.userServices.validarCamposUsuario(usuarios);
    await this.userServices.validateUpdateSecure(id, usuarios);
    await this.usuariosRepository.replaceById(id, {...usuarios, rol: 'cliente'});
  }

  @del('/clientes/{id}')
  @response(204, {
    description: 'Usuarios DELETE success'
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    const user = await this.usuariosRepository.findOne({where: {id: id}});
    if (user && user.rol == 'cliente') {
      await this.usuariosRepository.deleteById(id);
    } else if (!user) {
      throw new HttpErrors[400]('El susuario no existe');
    } else {
      throw new HttpErrors[400]('Usted no puede eliminar esta cuenta');
    }
  }

  @get('/clientes/{id}/vehiculos', {
    responses: {
      '200': {
        description: 'Array of Usuarios has many Vehiculos',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Vehiculos)}
          }
        }
      }
    }
  })
  async findUserVehiculos(@param.path.string('id') id: string, @param.query.object('filter') filter?: Filter<Vehiculos>): Promise<Vehiculos[]> {
    return this.usuariosRepository.vehiculos(id).find(filter);
  }

  @post('/clientes/{id}/vehiculos', {
    responses: {
      '200': {
        description: 'Usuarios model instance',
        content: {'application/json': {schema: getModelSchemaRef(Vehiculos)}}
      }
    }
  })
  async createUserVehiculo(
    @param.path.string('id') id: typeof Usuarios.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Vehiculos, {
            title: 'NewVehiculosInUsuarios',
            exclude: ['id', 'usuarioId'],
            optional: ['usuarioId']
          })
        }
      }
    })
    vehiculos: Omit<Vehiculos, 'id'>
  ): Promise<Vehiculos> {
    await this.vehiculoServices.validarExistenciaVehiculo(vehiculos.placa, true);
    return this.usuariosRepository.vehiculos(id).create(vehiculos);
  }

  @patch('/clientes/{id}/vehiculos', {
    responses: {
      '200': {
        description: 'Usuarios.Vehiculos PATCH success count',
        content: {'application/json': {schema: CountSchema}}
      }
    }
  })
  async patchUserVehiculos(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Vehiculos, {partial: true, exclude: ['id', 'usuarioId']})
        }
      }
    })
    vehiculos: Partial<Vehiculos>,
    @param.query.object('where', getWhereSchemaFor(Vehiculos)) where?: Where<Vehiculos>
  ): Promise<Count> {
    if (vehiculos.placa) throw new HttpErrors[400]('No puedes cambiar las placas de todos vehiculos por un solo valor');
    return this.usuariosRepository.vehiculos(id).patch(vehiculos, where);
  }

  @del('/clientes/{id}/vehiculos', {
    responses: {
      '200': {
        description: 'Usuarios.Vehiculos DELETE success count',
        content: {'application/json': {schema: CountSchema}}
      }
    }
  })
  async deleteUserVehiculos(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Vehiculos)) where?: Where<Vehiculos>
  ): Promise<Count> {
    return this.usuariosRepository.vehiculos(id).delete(where);
  }
}
