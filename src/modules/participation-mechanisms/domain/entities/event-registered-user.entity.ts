import { ApiProperty } from '@nestjs/swagger';

export class EventRegisteredUser {
  @ApiProperty({
    description: 'Participation register ID',
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
    description: 'Registration type - if user registered in own name',
    example: true,
  })
  ownUser: boolean;

  @ApiProperty({
    description: 'Organization name if not registered in own name',
    example: 'N/A',
    nullable: true,
  })
  organizationName: string | null;

  @ApiProperty({
    description: 'Organization NIT if not registered in own name',
    example: '900123456-1',
    nullable: true,
  })
  organizationNit: string | null;

  @ApiProperty({
    description: 'Organization email if not registered in own name',
    example: 'org@example.com',
    nullable: true,
  })
  organizationEmail: string | null;

  @ApiProperty({
    description: 'Organization role if not registered in own name',
    example: 'Representative',
    nullable: true,
  })
  organizationRole: string | null;

  @ApiProperty({
    description: 'SIMI event code',
    example: 'SIMI-2024-001',
  })
  simiEventCode: string;

  @ApiProperty({
    description: 'Registration date',
    example: new Date(),
  })
  registrationDate: Date;
}
