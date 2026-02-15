import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../services/auth.service';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  token: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET', 'secret');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user: unknown = await this.authService.validateJwtToken(
      payload.token,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
