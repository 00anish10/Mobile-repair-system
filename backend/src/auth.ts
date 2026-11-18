import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { FastifyReply, FastifyRequest } from 'fastify';

export type UserRole = 'customer' | 'admin' | 'technician';

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  name: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(user: AuthUser): string {
  return jwt.sign(
    { sub: String(user.id), email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  );
}

function extractToken(request: FastifyRequest): string | null {
  const header = request.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (!token || scheme.toLowerCase() !== 'bearer') return null;
  return token;
}

export async function authenticate(request: FastifyRequest): Promise<void> {
  const token = extractToken(request);
  if (!token) {
    throw Object.assign(new Error('Authentication required'), { statusCode: 401 });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    request.user = {
      id: Number(payload.sub),
      email: String(payload.email),
      role: payload.role as UserRole,
      name: String(payload.name),
    };
  } catch {
    throw Object.assign(new Error('Invalid or expired token'), { statusCode: 401 });
  }
}

export async function optionalAuth(request: FastifyRequest): Promise<void> {
  const token = extractToken(request);
  if (!token) return;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    request.user = {
      id: Number(payload.sub),
      email: String(payload.email),
      role: payload.role as UserRole,
      name: String(payload.name),
    };
  } catch {
    // Ignore invalid tokens for optional auth
  }
}

export function requireRole(...roles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      await reply.code(401).send({ error: 'Authentication required' });
      return;
    }
    if (!roles.includes(request.user.role)) {
      await reply.code(403).send({ error: 'You do not have permission to do that' });
    }
  };
}
