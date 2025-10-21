import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { User } from 'src/modules/users/domain/entities/user.entity';

export const GetUser = createParamDecorator(
  (data: keyof User | Array<keyof User> | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user: User | undefined = req.user;

    if (!user) {
      throw new InternalServerErrorException('User not found (request)');
    }

    if (data) {
      if (Array.isArray(data)) {
        return data.map((key) => {
          return { [key]: user[key] };
        });
      } else {
        return user[data];
      }
    }

    return user;
  },
);
