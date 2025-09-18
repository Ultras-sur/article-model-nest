import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UserService } from "../user/user.service";
import TokenPayload from "./tokenPayload.interface";

@Injectable()
export class JWTRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
    constructor (private readonly configService: ConfigService,
    private readonly userService: UserService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
                return request?.cookies?.Refresh;
            }]),
            secretOrKey: configService.get('JWT_REFRESH_SECRET_KEY'),
            passReqToCallback: true
        });
    }

    validate(request: Request, payload: TokenPayload) {
        const refreshToken = request?.cookies?.Refresh;
        return this.userService.getUserIfRefreshTokenMatch(refreshToken, payload.userId);
    }
}

