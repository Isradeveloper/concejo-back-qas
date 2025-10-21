import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { UsersService } from '../../application/services/user.service';
import { ApiTags, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { User } from '../../domain/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UpdateUserDto } from '../../application/dto/update-user.dto';
import { PaginationType } from 'src/modules/common/domain/interfaces/pagination.interface';
import { PaginationDto } from 'src/modules/common/application/dto/pagination.dto';
import { CitedUser } from '../../domain/entities/cited-user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiOkResponse({ type: User })
  findOneById(@Param('id', ParseIntPipe) id: number): Promise<User | null> {
    return this.usersService.findOneById(id);
  }

  @Get('email/:email')
  @ApiOkResponse({ type: User })
  findOneByEmail(@Param('email') email: string): Promise<User> {
    return this.usersService.findOneByEmail(email);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Post()
  @ApiOkResponse({ type: User })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOkResponse({ type: User })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Get()
  @ApiOkResponse({ type: User, isArray: true })
  getAllUsers(@Query() paginationDto: PaginationDto): Promise<PaginationType<User>> {
    return this.usersService.getAllUsers(paginationDto);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOkResponse({ type: User })
  delete(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.delete(id);
  }

  @Get('get-all/cited')
  @ApiOkResponse({ type: CitedUser, isArray: true })
  async getCitedUsers(): Promise<CitedUser[]> {
    const result: CitedUser[] = await this.usersService.getCitedUsers();
    return result;
  }
}
