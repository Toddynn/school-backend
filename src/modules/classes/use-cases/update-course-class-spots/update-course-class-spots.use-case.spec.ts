import { Test, type TestingModule } from '@nestjs/testing';
import type { UpdateResult } from 'typeorm';
import { NotFoundClassException } from '../../errors/not-found-class.error';
import type { CourseClass } from '../../models/entities/course-class.entity';
import type { CourseClassesRepositoryInterface } from '../../models/interfaces/course-classes-repository.interface';
import { COURSE_CLASSES_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { CourseClassStatus } from '../../shared/enums/course-class-status.enum';
import { GetExistingCourseClassUseCase } from '../get-existing-course-class/get-existing-class.use-case';
import { UpdateCourseClassSpotsUseCase } from './update-course-class-spots.use-case';

describe('UpdateCourseClassSpotsUseCase', () => {
	let useCase: UpdateCourseClassSpotsUseCase;
	let mockCourseClassesRepository: jest.Mocked<CourseClassesRepositoryInterface>;
	let mockGetExistingCourseClassUseCase: jest.Mocked<GetExistingCourseClassUseCase>;

	const mockCourseClass: CourseClass = {
		id: '0194e7c5-8b7e-7000-8000-000000000001',
		title: 'Turma A',
		description: 'Descrição da turma',
		spots: 30,
		status: CourseClassStatus.AVAILABLE,
		start_date: new Date('2024-01-01'),
		end_date: new Date('2024-12-31'),
		course_id: '0194e7c5-8b7e-7000-8000-000000000010',
		course: {} as never,
		enrollments: [],
		created_at: new Date('2024-01-01'),
		updated_at: new Date('2024-01-01'),
	} as unknown as CourseClass;

	const mockUpdateResult: UpdateResult = {
		raw: [],
		affected: 1,
		generatedMaps: [],
	};

	beforeEach(async () => {
		mockCourseClassesRepository = {
			findOne: jest.fn(),
			find: jest.fn(),
			save: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			listAllClassesPaginated: jest.fn(),
		} as unknown as jest.Mocked<CourseClassesRepositoryInterface>;

		mockGetExistingCourseClassUseCase = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<GetExistingCourseClassUseCase>;

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UpdateCourseClassSpotsUseCase,
				{
					provide: COURSE_CLASSES_REPOSITORY_INTERFACE_KEY,
					useValue: mockCourseClassesRepository,
				},
				{
					provide: GetExistingCourseClassUseCase,
					useValue: mockGetExistingCourseClassUseCase,
				},
			],
		}).compile();

		useCase = module.get<UpdateCourseClassSpotsUseCase>(UpdateCourseClassSpotsUseCase);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		describe('decrement operation', () => {
			beforeEach(() => {
				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(mockCourseClass);
				mockCourseClassesRepository.update.mockResolvedValue(mockUpdateResult);
			});

			it('should decrement spots by 1', async () => {
				await useCase.execute(mockCourseClass.id, 'decrement');

				expect(mockCourseClassesRepository.update).toHaveBeenCalledWith(mockCourseClass.id, {
					spots: 29,
				});
			});

			it('should return update result after decrement', async () => {
				const result = await useCase.execute(mockCourseClass.id, 'decrement');

				expect(result).toEqual(mockUpdateResult);
			});

			it('should verify class exists before decrementing', async () => {
				await useCase.execute(mockCourseClass.id, 'decrement');

				expect(mockGetExistingCourseClassUseCase.execute).toHaveBeenCalledWith({ where: { id: mockCourseClass.id } }, { throwIfNotFound: true });
			});

			it('should decrement from 1 to 0', async () => {
				const classWithOneSpot: CourseClass = {
					...mockCourseClass,
					spots: 1,
				} as unknown as CourseClass;
				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(classWithOneSpot);

				await useCase.execute(mockCourseClass.id, 'decrement');

				expect(mockCourseClassesRepository.update).toHaveBeenCalledWith(mockCourseClass.id, {
					spots: 0,
				});
			});

			it('should allow decrement to negative (edge case)', async () => {
				const classWithZeroSpots: CourseClass = {
					...mockCourseClass,
					spots: 0,
				} as unknown as CourseClass;
				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(classWithZeroSpots);

				await useCase.execute(mockCourseClass.id, 'decrement');

				expect(mockCourseClassesRepository.update).toHaveBeenCalledWith(mockCourseClass.id, {
					spots: -1,
				});
			});
		});

		describe('increment operation', () => {
			beforeEach(() => {
				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(mockCourseClass);
				mockCourseClassesRepository.update.mockResolvedValue(mockUpdateResult);
			});

			it('should increment spots by 1', async () => {
				await useCase.execute(mockCourseClass.id, 'increment');

				expect(mockCourseClassesRepository.update).toHaveBeenCalledWith(mockCourseClass.id, {
					spots: 31,
				});
			});

			it('should return update result after increment', async () => {
				const result = await useCase.execute(mockCourseClass.id, 'increment');

				expect(result).toEqual(mockUpdateResult);
			});

			it('should verify class exists before incrementing', async () => {
				await useCase.execute(mockCourseClass.id, 'increment');

				expect(mockGetExistingCourseClassUseCase.execute).toHaveBeenCalledWith({ where: { id: mockCourseClass.id } }, { throwIfNotFound: true });
			});

			it('should increment from 0 to 1', async () => {
				const classWithZeroSpots: CourseClass = {
					...mockCourseClass,
					spots: 0,
				} as unknown as CourseClass;
				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(classWithZeroSpots);

				await useCase.execute(mockCourseClass.id, 'increment');

				expect(mockCourseClassesRepository.update).toHaveBeenCalledWith(mockCourseClass.id, {
					spots: 1,
				});
			});
		});

		describe('class not found', () => {
			it('should throw NotFoundClassException when class does not exist', async () => {
				mockGetExistingCourseClassUseCase.execute.mockRejectedValue(new NotFoundClassException('id: non-existent-id'));

				await expect(useCase.execute('non-existent-id', 'decrement')).rejects.toThrow(NotFoundClassException);
			});

			it('should not update when class is not found', async () => {
				mockGetExistingCourseClassUseCase.execute.mockRejectedValue(new NotFoundClassException('id: non-existent-id'));

				await expect(useCase.execute('non-existent-id', 'increment')).rejects.toThrow();

				expect(mockCourseClassesRepository.update).not.toHaveBeenCalled();
			});
		});

		describe('edge cases', () => {
			it('should handle null spots as 0', async () => {
				const classWithNullSpots: CourseClass = {
					...mockCourseClass,
					spots: null as unknown as number,
				} as unknown as CourseClass;
				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(classWithNullSpots);
				mockCourseClassesRepository.update.mockResolvedValue(mockUpdateResult);

				await useCase.execute(mockCourseClass.id, 'increment');

				expect(mockCourseClassesRepository.update).toHaveBeenCalledWith(mockCourseClass.id, {
					spots: 1,
				});
			});

			it('should handle undefined spots as 0', async () => {
				const classWithUndefinedSpots: CourseClass = {
					...mockCourseClass,
					spots: undefined as unknown as number,
				} as unknown as CourseClass;
				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(classWithUndefinedSpots);
				mockCourseClassesRepository.update.mockResolvedValue(mockUpdateResult);

				await useCase.execute(mockCourseClass.id, 'decrement');

				expect(mockCourseClassesRepository.update).toHaveBeenCalledWith(mockCourseClass.id, {
					spots: -1,
				});
			});
		});
	});
});
