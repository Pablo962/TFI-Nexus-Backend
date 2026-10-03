import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from './auth.service.js';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from '../../common/enums/role.enum.js';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService({ secret: 'test_secret' });
    authService = new AuthService(jwtService);
  });

  it('debe iniciar sesión exitosamente con credenciales válidas', async () => {
    const result = await authService.login({
      email: 'admin@nexus.com',
      password: 'Admin1234!',
    });

    expect(result).toHaveProperty('access_token');
    expect(result.user.email).toBe('admin@nexus.com');
    expect(result.user.role).toBe('ADMIN_HR');
  });

  it('debe lanzar UnauthorizedException ante contraseña incorrecta', async () => {
    await expect(
      authService.login({
        email: 'admin@nexus.com',
        password: 'PasswordIncorrecta999',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('debe registrar un nuevo usuario y permitir login', async () => {
    const registerResult = await authService.register({
      email: 'nuevo@nexus.com',
      password: 'Password123!',
      name: 'Usuario Nuevo',
      role: Role.EMPLOYEE,
    });

    expect(registerResult.user.email).toBe('nuevo@nexus.com');

    const loginResult = await authService.login({
      email: 'nuevo@nexus.com',
      password: 'Password123!',
    });

    expect(loginResult).toHaveProperty('access_token');
  });
});
