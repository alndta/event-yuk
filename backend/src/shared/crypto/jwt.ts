import jwt from 'jsonwebtoken';

const ISSUER = 'event-yuk';

/** Signs and verifies session tokens. The algorithm is pinned so a token cannot pick its own. */
export class TokenService {
  constructor(
    private readonly secret: string,
    private readonly ttl: string
  ) {}

  sign(userId: string): string {
    return jwt.sign({}, this.secret, {
      algorithm: 'HS256',
      subject: userId,
      issuer: ISSUER,
      expiresIn: this.ttl as jwt.SignOptions['expiresIn'],
    });
  }

  /** Returns the user id, or null for anything that is not a valid, unexpired token we issued. */
  verify(token: string): string | null {
    try {
      const payload = jwt.verify(token, this.secret, { algorithms: ['HS256'], issuer: ISSUER });
      return typeof payload === 'object' && typeof payload.sub === 'string' ? payload.sub : null;
    } catch {
      return null;
    }
  }
}
