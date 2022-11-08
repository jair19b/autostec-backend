import {HttpErrors} from '@loopback/rest';
import {Sedes} from './../models/sedes.model';
import {SedesRepository} from './../repositories/sedes.repository';

export class SedesServices {
  constructor(protected sedesRepository: SedesRepository) {}

  /** Validar existencia de una sede */
  public async validarExistenciaSede(id?: string, filter?: any): Promise<Sedes> {
    try {
      const sede = await this.sedesRepository.findById(id, filter);
      return sede;
    } catch (err) {
      throw new HttpErrors[400]('La sede no existe');
    }
  }
}
