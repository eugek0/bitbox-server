export interface ITokens {
  access: string;
  refresh: string;
}

export interface ITokenPayload {
  sub: string;
  iat: number;
  exp: number;
}
