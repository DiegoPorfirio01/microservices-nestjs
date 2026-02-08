import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../service/auth.service';

interface UserInfo {
  userId: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET') ?? 'secret-key';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any): Promise<UserInfo> {
    if (!payload) {
      throw new UnauthorizedException('Invalid JWT token');
    }

    const session = await this.authService.validateSessionToken(payload.sub);

    if (!session || !session.user) {
      throw new UnauthorizedException();
    }

    return {
      userId: session.user?.id,
      email: session.user?.email,
      role: session.user?.role,
    };
  }
}
