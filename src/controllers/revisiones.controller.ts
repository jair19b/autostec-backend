import {Count, CountSchema, Filter, FilterExcludingWhere, repository, Where} from '@loopback/repository';
import {del, get, getModelSchemaRef, param, patch, post, put, requestBody, response} from '@loopback/rest';
import {Revisiones, Usuarios} from '../models';
import {RevisionesRepository} from '../repositories';
import {VehiculosServices} from '../services';
import {Vehiculos} from './../models/vehiculos.model';
import {VehiculosRepository} from './../repositories/vehiculos.repository';

export class RevisionesController {
  protected vehiculosService: VehiculosServices;

  constructor(
    @repository(RevisionesRepository)
    public revisionesRepository: RevisionesRepository,
    @repository(VehiculosRepository)
    public vehiculosRepository: VehiculosRepository
  ) {
    this.vehiculosService = new VehiculosServices(vehiculosRepository);
  }

  @post('/revisiones/crear')
  @response(200, {
    description: 'Revisiones model instance',
    content: {'application/json': {schema: getModelSchemaRef(Revisiones)}}
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Revisiones, {
            title: 'NewRevisiones',
            exclude: ['id']
          })
        }
      }
    })
    revisiones: Omit<Revisiones, 'id'>
  ): Promise<Revisiones> {
    await this.vehiculosService.validarExistenciaVehiculo(revisiones.vehiculoId, false, true);
    return this.revisionesRepository.create(revisiones);
  }

  @get('/revisiones/count')
  @response(200, {
    description: 'Revisiones model count',
    content: {'application/json': {schema: CountSchema}}
  })
  async count(@param.where(Revisiones) where?: Where<Revisiones>): Promise<Count> {
    return this.revisionesRepository.count(where);
  }

  @get('/revisiones')
  @response(200, {
    description: 'Array of Revisiones model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Revisiones, {includeRelations: true})
        }
      }
    }
  })
  async find(@param.filter(Revisiones) filter?: Filter<Revisiones>): Promise<Revisiones[]> {
    return this.revisionesRepository.find(filter);
  }

  @get('/revisiones/{id}/vehiculo', {
    responses: {
      '200': {
        description: 'Vehiculos belonging to Revisiones',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Vehiculos)}
          }
        }
      }
    }
  })
  async getVehiculos(@param.path.string('id') id: typeof Revisiones.prototype.id): Promise<Vehiculos> {
    return this.revisionesRepository.vehiculo(id);
  }

  @get('/revisiones/{id}/mecanico', {
    responses: {
      '200': {
        description: 'Usuarios belonging to Revisiones',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Usuarios)}
          }
        }
      }
    }
  })
  async getUsuarios(@param.path.string('id') id: typeof Revisiones.prototype.id): Promise<Usuarios> {
    return this.revisionesRepository.mecanico(id);
  }

  @patch('/revisiones')
  @response(200, {
    description: 'Revisiones PATCH success count',
    content: {'application/json': {schema: CountSchema}}
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Revisiones, {partial: true})
        }
      }
    })
    revisiones: Revisiones,
    @param.where(Revisiones) where?: Where<Revisiones>
  ): Promise<Count> {
    return this.revisionesRepository.updateAll(revisiones, where);
  }

  @get('/revisiones/{id}')
  @response(200, {
    description: 'Revisiones model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Revisiones, {includeRelations: true})
      }
    }
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Revisiones, {exclude: 'where'}) filter?: FilterExcludingWhere<Revisiones>
  ): Promise<Revisiones> {
    return this.revisionesRepository.findById(id, filter);
  }

  @patch('/revisiones/{id}')
  @response(204, {
    description: 'Revisiones PATCH success'
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Revisiones, {partial: true})
        }
      }
    })
    revisiones: Revisiones
  ): Promise<void> {
    await this.revisionesRepository.updateById(id, revisiones);
  }

  @put('/revisiones/{id}')
  @response(204, {
    description: 'Revisiones PUT success'
  })
  async replaceById(@param.path.string('id') id: string, @requestBody() revisiones: Revisiones): Promise<void> {
    await this.revisionesRepository.replaceById(id, revisiones);
  }

  @del('/revisiones/{id}')
  @response(204, {
    description: 'Revisiones DELETE success'
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.revisionesRepository.deleteById(id);
  }
}
