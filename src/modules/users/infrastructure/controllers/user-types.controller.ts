import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserType } from '../../domain/entities/user-type.entity';
import { UserTypeService } from '../../application/services/user-type.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard())
@ApiBearerAuth()
@ApiTags('user-types')
@Controller('user-types')
export class UserTypesController {
  constructor(private readonly userTypeService: UserTypeService) {}

  @Get()
  @ApiOkResponse({ type: UserType, isArray: true })
  findAll(): Promise<UserType[]> {
    return this.userTypeService.getAll();
  }
}
