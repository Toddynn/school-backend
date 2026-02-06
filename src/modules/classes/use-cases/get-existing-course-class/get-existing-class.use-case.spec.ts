import { Test, type TestingModule } from '@nestjs/testing';
import { ClassAlreadyExistsException } from '../../errors/class-already-exists.error';
import { NotFoundClassException } from '../../errors/not-found-class.error';
import type { CourseClass } from '../../models/entities/course-class.entity';
import type { CourseClassesRepositoryInterface } from '../../models/interfaces/course-classes-repository.interface';
import { COURSE_CLASSES_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { CourseClassStatus } from '../../shared/enums/course-class-status.enum';
import { GetExistingCourseClassUseCase } from './get-existing-class.use-case';

describe('GetExistingCourseClassUseCase', () => {
	let useCase: GetExistingCourseClassUseCase;
	let mockCourseClassesRepository: jest.Mocked<CourseClassesRepositoryInterface>;

	const mockCourseClass: CourseClass = {
		id: '0194e7c5-8b7e-7000-8000-000000000001',
		title: 'Turma A',
		description: 'Descrição da turma',
		spots: 30,
		status: CourseClassStatus.AVAILABLE,
		start_date: new Date('2024-01-01'),
		end_date: new Date('2024-06-30'),
		course_id: '0194e7c5-8b7e-7000-8000-000000000010',
		course: {} as never,
		enrollments: [],
		created_at: new Date('2024-01-01'),
		updated_at: new Date('2024-01-01'),
	} as unknown as CourseClass;

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

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GetExistingCourseClassUseCase,
				{
					provide: COURSE_CLASSES_REPOSITORY_INTERFACE_KEY,
					useValue: mockCourseClassesRepository,
				},
			],
		}).compile();

		useCase = module.get<GetExistingCourseClassUseCase>(GetExistingCourseClassUseCase);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		describe('class found', () => {
			beforeEach(() => {
				mockCourseClassesRepository.findOne.mockResolvedValue(mockCourseClass);
			});

			it('should return class when found with no options', async () => {
				const result = await useCase.execute({ where: { id: mockCourseClass.id } });

				expect(mockCourseClassesRepository.findOne).toHaveBeenCalledWith({
					where: { id: mockCourseClass.id },
				});
				expect(result).toEqual(mockCourseClass);
			});

			it('should return class when found with throwIfNotFound: false', async () => {
				const result = await useCase.execute({ where: { id: mockCourseClass.id } }, { throwIfNotFound: false });

				expect(result).toEqual(mockCourseClass);
			});

			it('should throw ClassAlreadyExistsException when found with throwIfFound: true', async () => {
				await expect(useCase.execute({ where: { id: mockCourseClass.id } }, { throwIfFound: true })).rejects.toThrow(ClassAlreadyExistsException);
			});

			it('should include criteria in ClassAlreadyExistsException message', async () => {
				await expect(useCase.execute({ where: { id: mockCourseClass.id } }, { throwIfFound: true })).rejects.toThrow(
					`Turma já existe com os critérios: id: ${mockCourseClass.id}`,
				);
			});

			it('should return class when found with throwIfFound: false', async () => {
				const result = await useCase.execute({ where: { id: mockCourseClass.id } }, { throwIfFound: false });

				expect(result).toEqual(mockCourseClass);
			});
		});

		describe('class not found', () => {
			beforeEach(() => {
				mockCourseClassesRepository.findOne.mockResolvedValue(null);
			});

			it('should throw NotFoundClassException when not found with no options (default behavior)', async () => {
				await expect(useCase.execute({ where: { id: 'non-existent-id' } })).rejects.toThrow(NotFoundClassException);
			});

			it('should return null when not found with throwIfNotFound: false', async () => {
				const result = await useCase.execute({ where: { id: 'non-existent-id' } }, { throwIfNotFound: false });

				expect(result).toBeNull();
			});

			it('should throw NotFoundClassException when not found with throwIfNotFound: true', async () => {
				await expect(useCase.execute({ where: { id: 'non-existent-id' } }, { throwIfNotFound: true })).rejects.toThrow(NotFoundClassException);
			});

			it('should include criteria in NotFoundClassException message', async () => {
				await expect(useCase.execute({ where: { id: 'non-existent-id' } }, { throwIfNotFound: true })).rejects.toThrow(
					'Turma não encontrada com os critérios: id: non-existent-id',
				);
			});

			it('should not throw ClassAlreadyExistsException when not found with throwIfFound: true', async () => {
				const result = await useCase.execute({ where: { id: 'non-existent-id' } }, { throwIfFound: true });

				expect(result).toBeNull();
			});
		});

		describe('combined options', () => {
			it('should throw NotFoundClassException when not found with both options true', async () => {
				mockCourseClassesRepository.findOne.mockResolvedValue(null);

				await expect(useCase.execute({ where: { id: 'non-existent-id' } }, { throwIfNotFound: true, throwIfFound: true })).rejects.toThrow(
					NotFoundClassException,
				);
			});

			it('should throw ClassAlreadyExistsException when found with both options true', async () => {
				mockCourseClassesRepository.findOne.mockResolvedValue(mockCourseClass);

				await expect(useCase.execute({ where: { id: mockCourseClass.id } }, { throwIfNotFound: true, throwIfFound: true })).rejects.toThrow(
					ClassAlreadyExistsException,
				);
			});
		});

		describe('search by different criteria', () => {
			beforeEach(() => {
				mockCourseClassesRepository.findOne.mockResolvedValue(mockCourseClass);
			});

			it('should search by title', async () => {
				await useCase.execute({ where: { title: 'Turma A' } });

				expect(mockCourseClassesRepository.findOne).toHaveBeenCalledWith({
					where: { title: 'Turma A' },
				});
			});

			it('should search by course_id', async () => {
				await useCase.execute({ where: { course_id: mockCourseClass.course_id } });

				expect(mockCourseClassesRepository.findOne).toHaveBeenCalledWith({
					where: { course_id: mockCourseClass.course_id },
				});
			});

			it('should search by multiple criteria', async () => {
				await useCase.execute({
					where: {
						title: 'Turma A',
						course_id: mockCourseClass.course_id,
					},
				});

				expect(mockCourseClassesRepository.findOne).toHaveBeenCalledWith({
					where: {
						title: 'Turma A',
						course_id: mockCourseClass.course_id,
					},
				});
			});

			it('should handle relations in criteria', async () => {
				await useCase.execute({
					where: { id: mockCourseClass.id },
					relations: ['course', 'enrollments'],
				});

				expect(mockCourseClassesRepository.findOne).toHaveBeenCalledWith({
					where: { id: mockCourseClass.id },
					relations: ['course', 'enrollments'],
				});
			});
		});

		describe('edge cases', () => {
			it('should handle empty where clause with throwIfNotFound: false', async () => {
				mockCourseClassesRepository.findOne.mockResolvedValue(null);

				const result = await useCase.execute({ where: {} }, { throwIfNotFound: false });

				expect(result).toBeNull();
			});

			it('should throw when empty where clause and not found (default behavior)', async () => {
				mockCourseClassesRepository.findOne.mockResolvedValue(null);

				await expect(useCase.execute({ where: {} })).rejects.toThrow(NotFoundClassException);
			});

			it('should format multiple fields in error message', async () => {
				mockCourseClassesRepository.findOne.mockResolvedValue(null);

				await expect(useCase.execute({ where: { title: 'Test', course_id: '123' } }, { throwIfNotFound: true })).rejects.toThrow(
					'Turma não encontrada com os critérios: title: Test, course_id: 123',
				);
			});
		});
	});
});
