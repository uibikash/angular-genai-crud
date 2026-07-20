import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { UserService } from '../services/user.service';
import { firstValueFrom } from 'rxjs';

export const dashboardResolver: ResolveFn<{ users: any[] }> = async () => {
  const userService = inject(UserService);
  const users = await firstValueFrom(userService.getUsers());
  return { users };
};
