import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UserService } from "../user/user.service";
import TokenPayload from "./tokenPayload.interface";

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
    constructor (private readonly configService: ConfigService,
    private readonly userService: UserService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
                return request?.cookies?.Authentication;
            }]),
            secretOrKey: configService.get('JWT_SECRET_KEY')
        });
    }

    validate(payload: TokenPayload) {
        return this.userService.findUserById(payload.userId);
    }
}

