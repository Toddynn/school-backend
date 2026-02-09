import { Test, type TestingModule } from '@nestjs/testing';
import { EnrollmentAlreadyExistsException } from '../../errors/enrollment-already-exists.error';
import { NotFoundEnrollmentException } from '../../errors/not-found-enrollment.error';
import type { Enrollment } from '../../models/entities/enrollment.entity';
import type { EnrollmentsRepositoryInterface } from '../../models/interfaces/enrollments-repository.interface';
import { ENROLLMENT_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { GetExistingEnrollmentUseCase } from './get-existing-enrollment.use-case';

describe('GetExistingEnrollmentUseCase', () => {
	let useCase: GetExistingEnrollmentUseCase;
	let mockEnrollmentsRepository: jest.Mocked<EnrollmentsRepositoryInterface>;

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

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GetExistingEnrollmentUseCase,
				{
					provide: ENROLLMENT_REPOSITORY_INTERFACE_KEY,
					useValue: mockEnrollmentsRepository,
				},
			],
		}).compile();

		useCase = module.get<GetExistingEnrollmentUseCase>(GetExistingEnrollmentUseCase);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		describe('when enrollment exists', () => {
			beforeEach(() => {
				mockEnrollmentsRepository.findOne.mockResolvedValue(mockEnrollment);
			});

			it('should return the enrollment when found and no options are provided', async () => {
				const result = await useCase.execute({ where: { id: mockEnrollment.id } });

				expect(mockEnrollmentsRepository.findOne).toHaveBeenCalledWith({ where: { id: mockEnrollment.id } });
				expect(result).toEqual(mockEnrollment);
			});

			it('should return the enrollment when found with throwIfNotFound: true', async () => {
				const result = await useCase.execute({ where: { id: mockEnrollment.id } }, { throwIfNotFound: true });

				expect(result).toEqual(mockEnrollment);
			});

			it('should throw EnrollmentAlreadyExistsException when enrollment exists and throwIfFound is true', async () => {
				await expect(
					useCase.execute({ where: { user_id: mockEnrollment.user_id, class_id: mockEnrollment.class_id } }, { throwIfFound: true }),
				).rejects.toThrow(EnrollmentAlreadyExistsException);
			});

			it('should include field info in EnrollmentAlreadyExistsException message', async () => {
				await expect(useCase.execute({ where: { user_id: mockEnrollment.user_id } }, { throwIfFound: true })).rejects.toThrow();
			});
		});

		describe('when enrollment does not exist', () => {
			beforeEach(() => {
				mockEnrollmentsRepository.findOne.mockResolvedValue(null);
			});

			it('should return null when enrollment not found and throwIfNotFound is false', async () => {
				const result = await useCase.execute({ where: { id: 'non-existent-id' } }, { throwIfNotFound: false });

				expect(result).toBeNull();
			});

			it('should throw NotFoundEnrollmentException when enrollment not found and throwIfNotFound is true', async () => {
				await expect(useCase.execute({ where: { id: 'non-existent-id' } }, { throwIfNotFound: true })).rejects.toThrow(NotFoundEnrollmentException);
			});

			it('should include field info in NotFoundEnrollmentException message', async () => {
				await expect(useCase.execute({ where: { id: 'non-existent-id' } }, { throwIfNotFound: true })).rejects.toThrow(
					'Matrícula não encontrada com os critérios: id: non-existent-id',
				);
			});

			it('should return null when throwIfFound is true and enrollment not found', async () => {
				const result = await useCase.execute({ where: { user_id: 'new-user-id' } }, { throwIfFound: true });

				expect(result).toBeNull();
			});
		});

		describe('option normalization behavior', () => {
			it('should default throwIfNotFound to true when no options provided', async () => {
				mockEnrollmentsRepository.findOne.mockResolvedValue(null);

				await expect(useCase.execute({ where: { id: 'non-existent-id' } })).rejects.toThrow(NotFoundEnrollmentException);
			});

			it('should set throwIfNotFound to false when throwIfFound is true', async () => {
				mockEnrollmentsRepository.findOne.mockResolvedValue(null);

				const result = await useCase.execute({ where: { user_id: 'test-user-id' } }, { throwIfFound: true });

				expect(result).toBeNull();
			});
		});

		describe('complex where criteria', () => {
			it('should handle nested where criteria for course validation', async () => {
				mockEnrollmentsRepository.findOne.mockResolvedValue(mockEnrollment);

				const result = await useCase.execute(
					{
						where: {
							user_id: mockEnrollment.user_id,
							course_class: {
								course_id: 'some-course-id',
							},
						},
					},
					{ throwIfNotFound: false },
				);

				expect(mockEnrollmentsRepository.findOne).toHaveBeenCalledWith({
					where: {
						user_id: mockEnrollment.user_id,
						course_class: {
							course_id: 'some-course-id',
						},
					},
				});
				expect(result).toEqual(mockEnrollment);
			});

			it('should handle empty where clause', async () => {
				mockEnrollmentsRepository.findOne.mockResolvedValue(null);

				await expect(useCase.execute({ where: {} }, { throwIfNotFound: true })).rejects.toThrow(
					'Matrícula não encontrada com os critérios: criteria',
				);
			});
		});
	});
});
