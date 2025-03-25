import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Extracts the JWT from the Authorization header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // ignoreExpiration is set to false, which means that if the token is expired, the request will be rejected
      ignoreExpiration: false,
      // jwtConstants.secret is used to verify the signature of the JWT
      secretOrKey: jwtConstants.secret,
    });
  }

  // validate() method is called when the token is valid
  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
