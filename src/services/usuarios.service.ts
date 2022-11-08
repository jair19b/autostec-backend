import {HttpErrors} from '@loopback/rest';
import {Usuarios} from './../models/usuarios.model';
import {UsuariosRepository} from './../repositories/usuarios.repository';

export class UsuariosServices {
  constructor(protected usuariosRepository: UsuariosRepository) {}

  /* validar campos de un usuario */
  public validarCamposUsuario(data: Usuarios, rol: string = 'cliente'): void {
    const {nombres, apellidos, cedula, correo, telefono} = data;

    /* validacion general */
    if (!nombres || !nombres.match(/^[a-z]+(\s[a-z]+){0,1}$/gi))
      throw new HttpErrors[400]('Formato de nombres inválido, solo se permiten letras y espacio en blanco');
    if (!apellidos || !apellidos.match(/^[a-z]+(\s[a-z]+){0,1}$/gi))
      throw new HttpErrors[400]('Formato de los apellidos inválido, solo se permiten eltras y espacios en blanco');
    if (!cedula || !cedula.match(/^[0-9]{6,12}/gi)) throw new HttpErrors[400]('La cedula ingresada no es válida');
    if (!correo || !correo.match(/^[a-z0-9_-]+(?:\.[a-z0-9_-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/gi))
      throw new HttpErrors[400]('Formato del correo electronico inválido');
    if (!telefono || !telefono.match(/^[0-9]{10}/gi)) throw new HttpErrors[400]('El teléfono ingresado no es válido');

    /* Validacion de campos especificos de cliente */
    if (rol == 'cliente') {
      if (!data.ciudadResidencia || !data.ciudadResidencia.match(/^[a-z]+(\s[a-z]+){0,}/gi))
        throw new HttpErrors[400]('La ciudad ingresada no es válida');
    }

    /* validacion de campos de mecanico */
    if (rol == 'mecanico') {
      if (!data.nivelEstudios || !data.nivelEstudios.match(/[a-z]+/)) throw new HttpErrors[400]('El nivel de estudios no es válido');
    }
  }

  /** Comprueba que un usuario exista en la base de datos. Dispara un error si el usuario no existe */
  public async validarExistenciaUsuario(correo?: string, cedula?: string, id?: string): Promise<void> {
    const message: string = 'El usuario no existe';

    if (correo && cedula) {
      const user = await this.usuariosRepository.findOne({where: {or: [{correo: correo}, {cedula: cedula}]}});
      if (!user) throw new HttpErrors[400](message);
    } else if (correo) {
      const user = await this.usuariosRepository.findOne({where: {correo: correo}});
      if (!user) throw new HttpErrors[400](message);
    } else if (cedula) {
      const user = await this.usuariosRepository.findOne({where: {cedula: cedula}});
      if (!user) throw new HttpErrors[400](message);
    } else if (id) {
      try {
        await this.usuariosRepository.findById(id);
      } catch (err) {
        throw new HttpErrors[400](message);
      }
    }
  }

  /** Comprueba que un usuario no exista en la base de datos. Dispara un error si el usuario existe */
  public async validarInexistenciaUsuario(correo?: string, cedula?: string, id?: string): Promise<void> {
    const message: string = 'El usuario ya se encuentra registrado';

    if (correo && cedula) {
      const user = await this.usuariosRepository.findOne({where: {or: [{correo: correo}, {cedula: cedula}]}});
      if (user) throw new HttpErrors[400](message);
    } else if (correo) {
      const user = await this.usuariosRepository.findOne({where: {correo: correo}});
      if (user) throw new HttpErrors[400](message);
    } else if (cedula) {
      const user = await this.usuariosRepository.findOne({where: {cedula: cedula}});
      if (user) throw new HttpErrors[400](message);
    } else if (id) {
      const user = await this.usuariosRepository.findOne({where: {id: id}});
      if (user) throw new HttpErrors[400](message);
    }
  }

  /** Valida la actualizacion seguro de credenciales de usuarios en los metodos patch y put */
  public async validateUpdateSecure(id: string, request: Omit<Usuarios, 'id'>): Promise<void> {
    const currenUser = await this.usuariosRepository.findOne({where: {id: id}});
    if (!currenUser) throw new HttpErrors[400]('No se pude editar un usuario inexsitente');

    if (currenUser.correo != request.correo && currenUser.cedula != request.cedula) {
      const newUser = await this.usuariosRepository.findOne({where: {or: [{correo: request.correo}, {cedula: request.cedula}]}});
      if (newUser)
        throw new HttpErrors[400]('Estas inetnado cambiar las credenciales CORREO y CEDULA por credeciales que le pertenecen a otra cuenta');
      return;
    }

    if (currenUser.correo != request.correo) {
      const newUser = await this.usuariosRepository.findOne({where: {correo: request.correo}});
      if (newUser) throw new HttpErrors[400]('El correo ya está ocupado');
    } else if (currenUser.cedula != request.cedula) {
      const newUser = await this.usuariosRepository.findOne({where: {cedula: request.cedula}});
      if (newUser) throw new HttpErrors[400]('La cedula ya está ocupada');
    }
  }
}
