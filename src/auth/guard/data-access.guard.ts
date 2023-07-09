import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class DataAccessGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      return false;
    }
    const userId = user.id;
    
    const userObj = await this.userService.getUser(userId);
    if (!userObj) {
      return false;
    }
    request.userObj = userObj;
    return true;
  }
}
