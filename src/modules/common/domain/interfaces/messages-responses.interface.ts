import { ApiProperty } from '@nestjs/swagger';

export interface MessageResponse {
  message: string;
}

export interface MessageResponseWithToken extends MessageResponse {
  token: string;
}

export class MessageResponseClass {
  @ApiProperty({
    description: 'Mensaje de la respuesta',
    example: 'Message',
  })
  message: string;
}

export class MessageResponseWithTokenClass extends MessageResponseClass {
  @ApiProperty({
    description: 'JWT Token de acceso',
    example: 'Token',
  })
  token: string;
}
