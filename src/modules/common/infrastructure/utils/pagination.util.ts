import { PaginationDto } from '../../application/dto/pagination.dto';
import { Injectable } from '@nestjs/common';
import { PaginationInterface, PaginationType } from '../../domain/interfaces/pagination.interface';

type PaginatedPrismaDataParams<T> = {
  paginationDto: PaginationDto;
  prismaQuery: () => Promise<T[]>;
  countQuery: () => Promise<number>;
};

@Injectable()
export class PaginationUtil {
  private getPaginationParams(paginationDto: PaginationDto) {
    const { limit = 10, page = 1 } = paginationDto;

    const skip = (page - 1) * limit;

    return { limit, skip, page };
  }

  private calculatePaginationInfo(
    page: number,
    limit: number,
    totalCount: number,
  ): Omit<PaginationInterface, 'limit' | 'skip'> {
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };
  }

  async getPaginatedPrismaData<T>({
    paginationDto,
    prismaQuery,
    countQuery,
  }: PaginatedPrismaDataParams<T>): Promise<PaginationType<T>> {
    const { limit, skip, page } = this.getPaginationParams(paginationDto);

    const [data, totalCount] = await Promise.all([prismaQuery(), countQuery()]);

    const paginationInfo = this.calculatePaginationInfo(page, limit, totalCount);

    const pagination: PaginationInterface = {
      limit,
      skip,
      ...paginationInfo,
    };

    return {
      data,
      pagination,
    };
  }

  getSkipAndTake(paginationDto: PaginationDto) {
    const { limit, page } = this.getPaginationParams(paginationDto);

    return {
      skip: (page - 1) * limit,
      take: limit,
    };
  }
}
