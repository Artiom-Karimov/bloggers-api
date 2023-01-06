import IdGenerator from "../utils/idGenerator"
import { jwt as config } from '../../config/config'
import TokenPair from "./tokenPair";
import JwtTokenOperator, { TokenPayload } from "../utils/jwtTokenOperator";

export type SessionCreateType = {
    ip: string,
    deviceName: string,
    userId: string,
}

export default class SessionModel {
    constructor(
        public deviceId: string,
        public ip: string,
        public deviceName: string,
        public issuedAt: number,
        public expiresAt: number,
        public userId: string
    ) { }

    public static create(data: SessionCreateType): SessionModel {
        return new SessionModel(
            IdGenerator.generate(),
            data.ip,
            data.deviceName,
            Date.now(),
            Date.now() + config.refreshExpireMillis,
            data.userId,
        )
    }
    public update(data: SessionCreateType): SessionModel {
        this.ip = data.ip;
        this.deviceName = data.deviceName;
        this.issuedAt = Date.now();
        this.expiresAt = Date.now() + config.refreshExpireMillis;
        return this;
    }
    public getTokenPair(): TokenPair {
        return JwtTokenOperator.createTokenPair({
            userId: this.userId,
            deviceId: this.deviceId,
            issuedAt: this.issuedAt,
            exp: this.expiresAt,
        })
    }
    public tokenMatches(payload: TokenPayload): boolean {
        return this.issuedAt === payload.issuedAt &&
            this.userId === payload.userId;
    }
}