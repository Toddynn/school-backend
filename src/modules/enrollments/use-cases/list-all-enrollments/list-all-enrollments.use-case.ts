import { Inject, Injectable } from '@nestjs/common';
import type { ListAllEnrollmentsPaginationDto } from '../../models/dto/input/list-all-enrollments-pagination.dto';
import type { EnrollmentsRepositoryInterface } from '../../models/interfaces/enrollments-repository.interface';
import { ENROLLMENT_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';

@Injectable()
export class ListAllEnrollmentsUseCase {
	constructor(
		@Inject(ENROLLMENT_REPOSITORY_INTERFACE_KEY)
		private readonly enrollmentsRepository: EnrollmentsRepositoryInterface,
	) {}

	async execute(paginationDto: ListAllEnrollmentsPaginationDto) {
		return await this.enrollmentsRepository.listAllEnrollmentsPaginated(paginationDto);
	}
}
