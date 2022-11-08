import {HttpErrors} from '@loopback/rest';
import {Vehiculos} from './../models/vehiculos.model';
import {VehiculosRepository} from './../repositories/vehiculos.repository';

export class VehiculosServices {
  constructor(protected vehiculosRepository: VehiculosRepository) {}

  /* Valida el formato de una placa */
  public validarPlaca(placa: string): void {
    if (!placa || !placa.match(/^[A-Z]{3}[0-9]{3}$/g))
      throw new HttpErrors[400]('Formato de placa invalido. Debe cumplir con el formato MAYUZCULAS Y 3 números');
  }

  /** Validar campos de un vehiculo */
  public validarCamposVehiculo(data: Vehiculos): void {
    const {placa, tipoVehiculo, anio, modelo, capacidadPasajeros, cilindraje, paisOrigen, descripcion} = data;
    const expNombre = /^[a-z]+(\s[a-z]+){0,}/gi;

    this.validarPlaca(placa);
    if (!tipoVehiculo || !tipoVehiculo.match(expNombre)) throw new HttpErrors[400]('El tipo de vehiculo contiene caracteres no permitidos');
    if (!anio || !anio.match(/^[0-9]{4}$/gi)) throw new HttpErrors[400]('El año ingresado no es válido');
    if (!modelo || !modelo.match(/^[0-9]{4}$/gi)) throw new HttpErrors[400]('El modelo ingresado no es válido');
    if (!capacidadPasajeros || !capacidadPasajeros.match(/^[0-9]{2}$/gi)) throw new HttpErrors[400]('Capacidad de pasajeros no valida');
    if (!cilindraje || !cilindraje.match(/^[0-9]+$/gi)) throw new HttpErrors[400]('Cilidraje no valido');
    if (!paisOrigen || !paisOrigen.match(expNombre)) throw new HttpErrors[400]('Pais de origen no valido');
    if (!descripcion || descripcion.length < 5) throw new HttpErrors[400]('Necesitamos una descripcion del vehiculo de minimo 5 caracteres');
  }

  public async validarExistenciaVehiculo(placa: string, control: boolean = true): Promise<void> {
    const vehiculo = await this.vehiculosRepository.findOne({where: {placa: placa}});
    if (control && !vehiculo) throw new HttpErrors[400](`El vehiculo de placas ${placa} no existe`);
    if (!control && vehiculo) throw new HttpErrors[400](`El vehiculo de placas ${placa} ya se encuentra registrado`);
  }
}
