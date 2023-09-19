import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt_decode, { JwtPayload } from "jwt-decode";
dotenv.config();

interface UserPayload {
  id: string;
  username: string;
}

export function generateToken<T extends object = UserPayload>(user: T) {
  return jwt.sign(user, (process.env.JWT_SECRET as string) || "secret123", {
    expiresIn: "7d",
  });
}

interface GoogleUserInfo {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  nbf: number;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  locale: string;
  iat: number;
  exp: number;
  jti: string;
}

export function decodeGoogleToken(token: string) {
  const decoded = jwt_decode<GoogleUserInfo>(token);
  console.log(decoded);
  return decoded;
}

export function decodeToken<T extends object = UserPayload>(token: string): T {
  const payload = jwt.verify(
    token,
    (process.env.JWT_SECRET as string) || "secret123"
  );
  return JSON.parse(JSON.stringify(payload)) as T;
}

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const comparePasswords = (
  plainTextPassword: string,
  hashedPassword: string
) => bcrypt.compare(plainTextPassword, hashedPassword);
