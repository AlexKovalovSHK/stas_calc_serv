import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Получаем роли из декоратора @Roles()
    // Проверяем сначала метод (Handler), а затем класс (Controller)
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(), // Метод контроллера
      context.getClass(),   // Сам контроллер (класс)
    ]);

    // Если декоратора @Roles нет, разрешаем доступ
    if (!requiredRoles) {
      return true;
    }

    // 2. Получаем пользователя из запроса
    const { user } = context.switchToHttp().getRequest();

    // Проверяем наличие пользователя и массива ролей
    // Обратите внимание: поле называется 'role' (как вы настроили в маппере и JwtStrategy)
    if (!user || !user.role) {
      throw new ForbiddenException('Доступ запрещен: у пользователя отсутствуют роли');
    }

    // 3. Проверка ролей
    const hasRole = user.role.some((role: string) => requiredRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException('Недостаточно прав для выполнения этой операции');
    }

    return true;
  }
}