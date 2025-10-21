export interface ISeeder {
  seed(): Promise<void>;
}

export interface SeederConfig {
  name: string;
  priority: number;
  enabled: boolean;
}

export interface SeederConstructor {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (prisma: any): ISeeder;
}
