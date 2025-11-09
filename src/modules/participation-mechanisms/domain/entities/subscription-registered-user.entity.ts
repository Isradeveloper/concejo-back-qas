import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionRegisteredUser {
  @ApiProperty({
    description: 'Subscription register ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: 'User first name',
    example: 'Luis',
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Diaz Pérez',
    nullable: true,
  })
  lastName: string | null;

  @ApiProperty({
    description: 'User email',
    example: 'luis@gmail.com',
  })
  email: string;

  @ApiProperty({
    description: 'User document number',
    example: '10172369891',
  })
  documentNumber: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'User type information',
    example: { id: 1, name: 'Citizen' },
  })
  userType: {
    id: number;
    name: string;
  };

  @ApiProperty({
    description: 'Document type information',
    example: { id: 1, name: 'ID Card', abbreviation: 'CC' },
  })
  documentType: {
    id: number;
    name: string;
    abbreviation: string;
  };

  @ApiProperty({
    description: 'Dependency information',
    example: { id: 1, name: 'City Hall' },
    nullable: true,
  })
  dependency: {
    id: number;
    name: string;
  } | null;

  @ApiProperty({
    description: 'SIMI topic ID',
    example: '1',
  })
  simiTopicId: string;

  @ApiProperty({
    description: 'Topic name',
    example: 'salud',
  })
  topic: string;

  @ApiProperty({
    description: 'Registration date',
    example: new Date(),
  })
  registrationDate: Date;
}
