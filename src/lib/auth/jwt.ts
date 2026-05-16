import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "canor-dev-secret-change-in-production"
);

const JWT_ALG = "HS256";

export interface TokenPayload {
  userId: string;
  role?: string;
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ role: payload.role || "guest" })
    .setProtectedHeader({ alg: JWT_ALG })
    .setSubject(payload.userId)
    .setExpirationTime("24h")
    .setIssuedAt()
    .setIssuer("canor-v2")
    .setAudience("canor-api")
    .sign(JWT_SECRET);
}

export async function verifyToken(
  token: string
): Promise<{ valid: boolean; userId?: string; role?: string }> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: [JWT_ALG],
      issuer: "canor-v2",
      audience: "canor-api",
    });
    return {
      valid: true,
      userId: payload.sub as string,
      role: (payload as { role?: string }).role,
    };
  } catch {
    return { valid: false };
  }
}
