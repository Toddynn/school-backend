import { Test, type TestingModule } from '@nestjs/testing';
import type { DeleteResult, UpdateResult } from 'typeorm';
import { UpdateCourseClassSpotsUseCase } from '@/modules/classes/use-cases/update-course-class-spots/update-course-class-spots.use-case';
import { NotFoundEnrollmentException } from '../../errors/not-found-enrollment.error';
import type { Enrollment } from '../../models/entities/enrollment.entity';
import type { EnrollmentsRepositoryInterface } from '../../models/interfaces/enrollments-repository.interface';
import { ENROLLMENT_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { GetExistingEnrollmentUseCase } from '../get-existing-enrollment/get-existing-enrollment.use-case';
import { DeleteEnrollmentUseCase } from './delete-enrollment.use-case';

describe('DeleteEnrollmentUseCase', () => {
	let useCase: DeleteEnrollmentUseCase;
	let mockEnrollmentsRepository: jest.Mocked<EnrollmentsRepositoryInterface>;
	let mockGetExistingEnrollmentUseCase: jest.Mocked<GetExistingEnrollmentUseCase>;
	let mockUpdateCourseClassSpotsUseCase: jest.Mocked<UpdateCourseClassSpotsUseCase>;

	const mockEnrollment: Enrollment = {
		id: '0194e7c5-8b7e-7000-8000-000000000001',
		user_id: '0194e7c5-8b7e-7000-8000-000000000002',
		class_id: '0194e7c5-8b7e-7000-8000-000000000003',
		enrolled_at: new Date('2024-01-01'),
		user: {} as never,
		course_class: {} as never,
		created_at: new Date('2024-01-01'),
		updated_at: new Date('2024-01-01'),
	} as unknown as Enrollment;

	const mockDeleteResult: DeleteResult = {
		raw: [],
		affected: 1,
	};

	const mockUpdateResult: UpdateResult = {
		raw: [],
		affected: 1,
		generatedMaps: [],
	};

	beforeEach(async () => {
		mockEnrollmentsRepository = {
			findOne: jest.fn(),
			find: jest.fn(),
			save: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			listAllEnrollmentsPaginated: jest.fn(),
		} as unknown as jest.Mocked<EnrollmentsRepositoryInterface>;

		mockGetExistingEnrollmentUseCase = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<GetExistingEnrollmentUseCase>;

		mockUpdateCourseClassSpotsUseCase = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<UpdateCourseClassSpotsUseCase>;

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				DeleteEnrollmentUseCase,
				{
					provide: ENROLLMENT_REPOSITORY_INTERFACE_KEY,
					useValue: mockEnrollmentsRepository,
				},
				{
					provide: GetExistingEnrollmentUseCase,
					useValue: mockGetExistingEnrollmentUseCase,
				},
				{
					provide: UpdateCourseClassSpotsUseCase,
					useValue: mockUpdateCourseClassSpotsUseCase,
				},
			],
		}).compile();

		useCase = module.get<DeleteEnrollmentUseCase>(DeleteEnrollmentUseCase);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		describe('successful deletion', () => {
			beforeEach(() => {
				mockGetExistingEnrollmentUseCase.execute.mockResolvedValue(mockEnrollment);
				mockEnrollmentsRepository.delete.mockResolvedValue(mockDeleteResult);
				mockUpdateCourseClassSpotsUseCase.execute.mockResolvedValue(mockUpdateResult);
			});

			it('should delete an existing enrollment successfully', async () => {
				const result = await useCase.execute(mockEnrollment.id);

				expect(mockGetExistingEnrollmentUseCase.execute).toHaveBeenCalledWith({ where: { id: mockEnrollment.id } }, { throwIfNotFound: true });
				expect(mockEnrollmentsRepository.delete).toHaveBeenCalledWith(mockEnrollment.id);
				expect(result).toEqual(mockDeleteResult);
			});

			it('should return DeleteResult with affected count of 1', async () => {
				const result = await useCase.execute(mockEnrollment.id);

				expect(result.affected).toBe(1);
			});

			it('should verify enrollment existence before deletion', async () => {
				await useCase.execute(mockEnrollment.id);

				const getExistingCallOrder = mockGetExistingEnrollmentUseCase.execute.mock.invocationCallOrder[0];
				const deleteCallOrder = mockEnrollmentsRepository.delete.mock.invocationCallOrder[0];

				expect(getExistingCallOrder).toBeLessThan(deleteCallOrder);
			});

			it('should increment spots after successful deletion', async () => {
				await useCase.execute(mockEnrollment.id);

				expect(mockUpdateCourseClassSpotsUseCase.execute).toHaveBeenCalledWith(mockEnrollment.class_id, 'increment');
			});

			it('should increment spots only after deletion', async () => {
				let enrollmentDeleted = false;
				mockEnrollmentsRepository.delete.mockImplementation(async () => {
					enrollmentDeleted = true;
					return mockDeleteResult;
				});
				mockUpdateCourseClassSpotsUseCase.execute.mockImplementation(async () => {
					expect(enrollmentDeleted).toBe(true);
					return mockUpdateResult;
				});

				await useCase.execute(mockEnrollment.id);

				expect(mockUpdateCourseClassSpotsUseCase.execute).toHaveBeenCalled();
			});
		});

		describe('enrollment not found', () => {
			it('should throw NotFoundEnrollmentException when enrollment does not exist', async () => {
				const nonExistentId = 'non-existent-id';
				mockGetExistingEnrollmentUseCase.execute.mockRejectedValue(new NotFoundEnrollmentException(`id: ${nonExistentId}`));

				await expect(useCase.execute(nonExistentId)).rejects.toThrow(NotFoundEnrollmentException);
			});

			it('should not call delete when enrollment is not found', async () => {
				mockGetExistingEnrollmentUseCase.execute.mockRejectedValue(new NotFoundEnrollmentException('id: non-existent-id'));

				await expect(useCase.execute('non-existent-id')).rejects.toThrow();

				expect(mockEnrollmentsRepository.delete).not.toHaveBeenCalled();
			});

			it('should not increment spots when enrollment is not found', async () => {
				mockGetExistingEnrollmentUseCase.execute.mockRejectedValue(new NotFoundEnrollmentException('id: non-existent-id'));

				await expect(useCase.execute('non-existent-id')).rejects.toThrow();

				expect(mockUpdateCourseClassSpotsUseCase.execute).not.toHaveBeenCalled();
			});

			it('should include enrollment id in error message', async () => {
				const nonExistentId = '0194e7c5-8b7e-7000-8000-999999999999';
				mockGetExistingEnrollmentUseCase.execute.mockRejectedValue(new NotFoundEnrollmentException(`id: ${nonExistentId}`));

				await expect(useCase.execute(nonExistentId)).rejects.toThrow(`Matrícula não encontrada com os critérios: id: ${nonExistentId}`);
			});
		});

		describe('edge cases', () => {
			beforeEach(() => {
				mockUpdateCourseClassSpotsUseCase.execute.mockResolvedValue(mockUpdateResult);
			});

			it('should handle deletion with zero affected rows', async () => {
				const zeroAffectedResult: DeleteResult = {
					raw: [],
					affected: 0,
				};

				mockGetExistingEnrollmentUseCase.execute.mockResolvedValue(mockEnrollment);
				mockEnrollmentsRepository.delete.mockResolvedValue(zeroAffectedResult);

				const result = await useCase.execute(mockEnrollment.id);

				expect(result.affected).toBe(0);
			});

			it('should pass the exact enrollmentId to repository delete method', async () => {
				const specificId = '0194e7c5-8b7e-7000-8000-123456789abc';
				mockGetExistingEnrollmentUseCase.execute.mockResolvedValue({
					...mockEnrollment,
					id: specificId,
				} as unknown as Enrollment);
				mockEnrollmentsRepository.delete.mockResolvedValue(mockDeleteResult);

				await useCase.execute(specificId);

				expect(mockEnrollmentsRepository.delete).toHaveBeenCalledWith(specificId);
			});

			it('should not increment spots when enrollment has no class_id', async () => {
				const enrollmentWithoutClassId: Enrollment = {
					...mockEnrollment,
					class_id: undefined as unknown as string,
				} as unknown as Enrollment;

				mockGetExistingEnrollmentUseCase.execute.mockResolvedValue(enrollmentWithoutClassId);
				mockEnrollmentsRepository.delete.mockResolvedValue(mockDeleteResult);

				await useCase.execute(enrollmentWithoutClassId.id);

				expect(mockUpdateCourseClassSpotsUseCase.execute).not.toHaveBeenCalled();
			});

			it('should use class_id from enrollment to increment spots', async () => {
				const specificClassId = '0194e7c5-8b7e-7000-8000-specific-class';
				const enrollmentWithSpecificClass: Enrollment = {
					...mockEnrollment,
					class_id: specificClassId,
				} as unknown as Enrollment;

				mockGetExistingEnrollmentUseCase.execute.mockResolvedValue(enrollmentWithSpecificClass);
				mockEnrollmentsRepository.delete.mockResolvedValue(mockDeleteResult);

				await useCase.execute(enrollmentWithSpecificClass.id);

				expect(mockUpdateCourseClassSpotsUseCase.execute).toHaveBeenCalledWith(specificClassId, 'increment');
			});
		});
	});
});
