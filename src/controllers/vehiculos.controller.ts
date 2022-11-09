import {Count, CountSchema, Filter, FilterExcludingWhere, repository, Where} from '@loopback/repository';
import {del, get, getModelSchemaRef, getWhereSchemaFor, HttpErrors, param, patch, post, put, requestBody, response} from '@loopback/rest';
import {Vehiculos} from '../models';
import {VehiculosRepository} from '../repositories';
import {UsuariosServices, VehiculosServices} from '../services';
import {Revisiones} from './../models/revisiones.model';
import {Usuarios} from './../models/usuarios.model';
import {UsuariosRepository} from './../repositories/usuarios.repository';

export class VehiculosController {
  private userServices: UsuariosServices;
  private vehiculosServices: VehiculosServices;

  constructor(
    @repository(VehiculosRepository)
    public vehiculosRepository: VehiculosRepository,
    @repository(UsuariosRepository)
    public usuariosRepository: UsuariosRepository
  ) {
    this.userServices = new UsuariosServices(usuariosRepository);
    this.vehiculosServices = new VehiculosServices(vehiculosRepository);
  }

  @post('/vehiculos/registrar')
  @response(200, {
    description: 'Vehiculos model instance',
    content: {'application/json': {schema: getModelSchemaRef(Vehiculos)}}
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Vehiculos, {
            title: 'NewVehiculos',
            exclude: ['id']
          })
        }
      }
    })
    vehiculos: Omit<Vehiculos, 'id'>
  ): Promise<Vehiculos> {
    this.vehiculosServices.validarCamposVehiculo(vehiculos);
    await this.vehiculosServices.validarExistenciaVehiculo(vehiculos.placa, false);
    await this.userServices.validarExistenciaUsuario(undefined, undefined, vehiculos.usuarioId);
    return this.vehiculosRepository.create(vehiculos);
  }

  @get('/vehiculos/count')
  @response(200, {
    description: 'Vehiculos model count',
    content: {'application/json': {schema: CountSchema}}
  })
  async count(@param.where(Vehiculos) where?: Where<Vehiculos>): Promise<Count> {
    return this.vehiculosRepository.count(where);
  }

  @get('/vehiculos')
  @response(200, {
    description: 'Array of Vehiculos model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Vehiculos, {includeRelations: true})
        }
      }
    }
  })
  async find(@param.filter(Vehiculos) filter?: Filter<Vehiculos>): Promise<Vehiculos[]> {
    return this.vehiculosRepository.find(filter);
  }

  @patch('/vehiculos')
  @response(200, {
    description: 'Vehiculos PATCH success count',
    content: {'application/json': {schema: CountSchema}}
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Vehiculos, {partial: true})
        }
      }
    })
    vehiculos: Vehiculos,
    @param.where(Vehiculos) where?: Where<Vehiculos>
  ): Promise<Count> {
    return this.vehiculosRepository.updateAll(vehiculos, where);
  }

  @get('/vehiculos/{id}')
  @response(200, {
    description: 'Vehiculos model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Vehiculos, {includeRelations: true})
      }
    }
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Vehiculos, {exclude: 'where'}) filter?: FilterExcludingWhere<Vehiculos>
  ): Promise<Vehiculos> {
    try {
      return this.vehiculosRepository.findById(id, filter);
    } catch (error) {
      throw new HttpErrors[400]('El vehiculo no esxiste');
    }
  }

  @patch('/vehiculos/{id}')
  @response(204, {
    description: 'Vehiculos PATCH success'
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Vehiculos, {partial: true})
        }
      }
    })
    vehiculos: Vehiculos
  ): Promise<void> {
    try {
      await this.vehiculosRepository.updateById(id, vehiculos);
    } catch (error) {
      throw new HttpErrors[400]('El vehiculo no esxiste');
    }
  }

  @put('/vehiculos/{id}')
  @response(204, {
    description: 'Vehiculos PUT success'
  })
  async replaceById(@param.path.string('id') id: string, @requestBody() vehiculos: Vehiculos): Promise<void> {
    try {
      await this.vehiculosRepository.replaceById(id, vehiculos);
    } catch (error) {
      throw new HttpErrors[400]('El vehiculo no esxiste');
    }
  }

  @del('/vehiculos/{id}')
  @response(204, {
    description: 'Vehiculos DELETE success'
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.vehiculosRepository.deleteById(id);
  }

  @get('/vehiculos/{id}/cliente', {
    responses: {
      '200': {
        description: 'Usuarios belonging to Vehiculos',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Usuarios)}
          }
        }
      }
    }
  })
  async getUsuarios(@param.path.string('id') id: typeof Vehiculos.prototype.id): Promise<Usuarios> {
    return this.vehiculosRepository.usuario(id);
  }

  @get('/vehiculos/{id}/revisiones', {
    responses: {
      '200': {
        description: 'Array of Vehiculos has many Revisiones',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Revisiones)}
          }
        }
      }
    }
  })
  async findRevision(@param.path.string('id') id: string, @param.query.object('filter') filter?: Filter<Revisiones>): Promise<Revisiones[]> {
    return this.vehiculosRepository.revisiones(id).find(filter);
  }

  @post('/vehiculo/{id}/create/revision', {
    responses: {
      '200': {
        description: 'Vehiculos model instance',
        content: {'application/json': {schema: getModelSchemaRef(Revisiones)}}
      }
    }
  })
  async createRevison(
    @param.path.string('id') id: typeof Vehiculos.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Revisiones, {
            title: 'NewRevisionesInVehiculos',
            exclude: ['id', 'vehiculoId']
          })
        }
      }
    })
    revisiones: Omit<Revisiones, 'id'>
  ): Promise<Revisiones> {
    const user = await this.usuariosRepository.findOne({where: {and: [{id: revisiones.mecanicoId}, {rol: 'mecanico'}]}});
    if (!user) throw new HttpErrors[400]('No podemos encontrar el mecanico para esta revison');
    return this.vehiculosRepository.revisiones(id).create(revisiones);
  }

  @patch('/vehiculo/{id}/revisiones', {
    responses: {
      '200': {
        description: 'Vehiculos.Revisiones PATCH success count',
        content: {'application/json': {schema: CountSchema}}
      }
    }
  })
  async patchRevisiones(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Revisiones, {partial: true})
        }
      }
    })
    revisiones: Partial<Revisiones>,
    @param.query.object('where', getWhereSchemaFor(Revisiones)) where?: Where<Revisiones>
  ): Promise<Count> {
    await this.vehiculosServices.validarExistenciaVehiculo(id, false, true);
    return this.vehiculosRepository.revisiones(id).patch(revisiones, where);
  }

  @del('/vehiculo/{id}/revisiones', {
    responses: {
      '200': {
        description: 'Vehiculos.Revisiones DELETE success count',
        content: {'application/json': {schema: CountSchema}}
      }
    }
  })
  async deleteRevisiones(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Revisiones)) where?: Where<Revisiones>
  ): Promise<Count> {
    await this.vehiculosServices.validarExistenciaVehiculo(id, false, true);
    return this.vehiculosRepository.revisiones(id).delete(where);
  }
}
