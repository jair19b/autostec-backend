import * as jose from 'jose';

export class AutenticationService {
  private audience: string;

  constructor() {
    this.audience = 'http://localhost:3000';
  }

  /** Firmar un token */
  public async singToken(userId: string, nombre: string, rol: string): Promise<string> {
    const payload = {
      userId,
      nombre,
      rol
    };

    const clave = await this.createKey();

    const jwt = await new jose.SignJWT(payload)
      .setProtectedHeader({alg: 'ES256'})
      .setIssuedAt()
      .setIssuer(this.audience)
      .setAudience(this.audience)
      .setExpirationTime('2h')
      .sign(clave);

    return jwt;
  }

  /** Vlaida un JWT */
  public async validateToken(jwt: string, key: jose.KeyLike | Uint8Array, rol: string = 'cliente') {
    try {
      const {payload, protectedHeader} = await jose.jwtVerify(jwt, key, {
        issuer: 'urn:example:issuer',
        audience: 'urn:example:audience'
      });

      if (payload.rol != rol) {
        return false;
      }

      return payload;
    } catch (error) {
      return false;
    }
  }

  /** Crea una clave de un token */
  public async createKey(): Promise<jose.KeyLike | Uint8Array> {
    const ecPublicKey = await jose.importJWK(
      {
        crv: 'P-256',
        kty: 'EC',
        x: 'ySK38C1jBdLwDsNWKzzBHqKYEE5Cgv-qjWvorUXk9fw',
        y: '_LeQBw07cf5t57Iavn4j-BqJsAD1dpoz8gokd3sBsOo'
      },
      'ES256'
    );

    return ecPublicKey;
  }
}
