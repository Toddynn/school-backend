import { Test, type TestingModule } from '@nestjs/testing';
import { CourseAlreadyExistsException } from '../../errors/course-already-exists.error';
import { NotFoundCourseException } from '../../errors/not-found-course.error';
import type { Course } from '../../models/entities/course.entity';
import type { CoursesRepositoryInterface } from '../../models/interfaces/courses-repository.interface';
import { COURSE_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { CourseTheme } from '../../shared/enums/course-theme.enum';
import { GetExistingCourseUseCase } from './get-existing-course.use-case';

describe('GetExistingCourseUseCase', () => {
	let useCase: GetExistingCourseUseCase;
	let mockCoursesRepository: jest.Mocked<CoursesRepositoryInterface>;

	const mockCourse: Course = {
		id: '0194e7c5-8b7e-7000-8000-000000000001',
		title: 'Curso de TypeScript',
		description: 'Aprenda TypeScript do zero ao avançado',
		image_url: 'https://example.com/typescript.png',
		themes: [CourseTheme.TECHNOLOGY],
		classes: [],
		created_at: new Date('2024-01-01'),
		updated_at: new Date('2024-01-01'),
	} as unknown as Course;

	beforeEach(async () => {
		mockCoursesRepository = {
			findOne: jest.fn(),
			find: jest.fn(),
			save: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			listAllCoursesPaginated: jest.fn(),
		} as unknown as jest.Mocked<CoursesRepositoryInterface>;

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GetExistingCourseUseCase,
				{
					provide: COURSE_REPOSITORY_INTERFACE_KEY,
					useValue: mockCoursesRepository,
				},
			],
		}).compile();

		useCase = module.get<GetExistingCourseUseCase>(GetExistingCourseUseCase);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		describe('when course exists', () => {
			beforeEach(() => {
				mockCoursesRepository.findOne.mockResolvedValue(mockCourse);
			});

			it('should return the course when found and no options are provided', async () => {
				const result = await useCase.execute({ where: { id: mockCourse.id } });

				expect(mockCoursesRepository.findOne).toHaveBeenCalledWith({ where: { id: mockCourse.id } });
				expect(result).toEqual(mockCourse);
			});

			it('should return the course when found with throwIfNotFound: true', async () => {
				const result = await useCase.execute({ where: { id: mockCourse.id } }, { throwIfNotFound: true });

				expect(result).toEqual(mockCourse);
			});

			it('should throw CourseAlreadyExistsException when course exists and throwIfFound is true', async () => {
				await expect(useCase.execute({ where: { title: mockCourse.title } }, { throwIfFound: true })).rejects.toThrow(CourseAlreadyExistsException);
			});

			it('should include field info in CourseAlreadyExistsException message', async () => {
				await expect(useCase.execute({ where: { title: mockCourse.title } }, { throwIfFound: true })).rejects.toThrow(
					`Curso já existe com os critérios: title: ${mockCourse.title}`,
				);
			});
		});

		describe('when course does not exist', () => {
			beforeEach(() => {
				mockCoursesRepository.findOne.mockResolvedValue(null);
			});

			it('should return null when course not found and throwIfNotFound is false', async () => {
				const result = await useCase.execute({ where: { id: 'non-existent-id' } }, { throwIfNotFound: false });

				expect(result).toBeNull();
			});

			it('should throw NotFoundCourseException when course not found and throwIfNotFound is true', async () => {
				await expect(useCase.execute({ where: { id: 'non-existent-id' } }, { throwIfNotFound: true })).rejects.toThrow(NotFoundCourseException);
			});

			it('should include field info in NotFoundCourseException message', async () => {
				await expect(useCase.execute({ where: { id: 'non-existent-id' } }, { throwIfNotFound: true })).rejects.toThrow(
					'Curso não encontrado com os critérios: id: non-existent-id',
				);
			});

			it('should return null when throwIfFound is true and course not found', async () => {
				const result = await useCase.execute({ where: { title: 'Non-existent Course' } }, { throwIfFound: true });

				expect(result).toBeNull();
			});
		});

		describe('option normalization behavior', () => {
			it('should default throwIfNotFound to true when no options provided', async () => {
				mockCoursesRepository.findOne.mockResolvedValue(null);

				await expect(useCase.execute({ where: { id: 'non-existent-id' } })).rejects.toThrow(NotFoundCourseException);
			});

			it('should set throwIfNotFound to false when throwIfFound is true', async () => {
				mockCoursesRepository.findOne.mockResolvedValue(null);

				const result = await useCase.execute({ where: { title: 'test-course' } }, { throwIfFound: true });

				expect(result).toBeNull();
			});
		});

		describe('edge cases', () => {
			it('should handle empty where clause', async () => {
				mockCoursesRepository.findOne.mockResolvedValue(null);

				await expect(useCase.execute({ where: {} }, { throwIfNotFound: true })).rejects.toThrow('Curso não encontrado com os critérios: criteria');
			});

			it('should handle multiple where criteria', async () => {
				mockCoursesRepository.findOne.mockResolvedValue(mockCourse);

				const result = await useCase.execute({ where: { title: 'Curso de TypeScript', id: mockCourse.id } }, { throwIfNotFound: true });

				expect(mockCoursesRepository.findOne).toHaveBeenCalledWith({
					where: { title: 'Curso de TypeScript', id: mockCourse.id },
				});
				expect(result).toEqual(mockCourse);
			});
		});
	});
});
