import { Test, type TestingModule } from '@nestjs/testing';
import type { UpdateResult } from 'typeorm';
import { NotFoundCourseException } from '../../errors/not-found-course.error';
import type { UpdateCourseDto } from '../../models/dto/input/update-course.dto';
import type { Course } from '../../models/entities/course.entity';
import type { CoursesRepositoryInterface } from '../../models/interfaces/courses-repository.interface';
import { COURSE_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { CourseTheme } from '../../shared/enums/course-theme.enum';
import { GetExistingCourseUseCase } from '../get-existing-course/get-existing-course.use-case';
import { UpdateCourseUseCase } from './update-course.use-case';

describe('UpdateCourseUseCase', () => {
	let useCase: UpdateCourseUseCase;
	let mockCoursesRepository: jest.Mocked<CoursesRepositoryInterface>;
	let mockGetExistingCourseUseCase: jest.Mocked<GetExistingCourseUseCase>;

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

	const mockUpdateResult: UpdateResult = {
		raw: [],
		affected: 1,
		generatedMaps: [],
	};

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

		mockGetExistingCourseUseCase = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<GetExistingCourseUseCase>;

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UpdateCourseUseCase,
				{
					provide: COURSE_REPOSITORY_INTERFACE_KEY,
					useValue: mockCoursesRepository,
				},
				{
					provide: GetExistingCourseUseCase,
					useValue: mockGetExistingCourseUseCase,
				},
			],
		}).compile();

		useCase = module.get<UpdateCourseUseCase>(UpdateCourseUseCase);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		describe('successful update', () => {
			beforeEach(() => {
				mockGetExistingCourseUseCase.execute.mockResolvedValue(mockCourse);
				mockCoursesRepository.update.mockResolvedValue(mockUpdateResult);
			});

			it('should update an existing course successfully', async () => {
				const updateDto: UpdateCourseDto = { title: 'Curso de JavaScript' };

				const result = await useCase.execute(mockCourse.id, updateDto);

				expect(mockGetExistingCourseUseCase.execute).toHaveBeenCalledWith({ where: { id: mockCourse.id } }, { throwIfNotFound: true });
				expect(mockCoursesRepository.update).toHaveBeenCalledWith(mockCourse.id, updateDto);
				expect(result).toEqual(mockUpdateResult);
			});

			it('should update course title only', async () => {
				const updateDto: UpdateCourseDto = { title: 'Novo Título' };

				await useCase.execute(mockCourse.id, updateDto);

				expect(mockCoursesRepository.update).toHaveBeenCalledWith(mockCourse.id, { title: 'Novo Título' });
			});

			it('should update course description only', async () => {
				const updateDto: UpdateCourseDto = { description: 'Nova descrição do curso' };

				await useCase.execute(mockCourse.id, updateDto);

				expect(mockCoursesRepository.update).toHaveBeenCalledWith(mockCourse.id, {
					description: 'Nova descrição do curso',
				});
			});

			it('should update course image_url only', async () => {
				const updateDto: UpdateCourseDto = { image_url: 'https://example.com/new-image.png' };

				await useCase.execute(mockCourse.id, updateDto);

				expect(mockCoursesRepository.update).toHaveBeenCalledWith(mockCourse.id, {
					image_url: 'https://example.com/new-image.png',
				});
			});

			it('should update course themes only', async () => {
				const updateDto: UpdateCourseDto = {
					themes: [CourseTheme.MARKETING, CourseTheme.ENTREPRENEURSHIP],
				};

				await useCase.execute(mockCourse.id, updateDto);

				expect(mockCoursesRepository.update).toHaveBeenCalledWith(mockCourse.id, {
					themes: [CourseTheme.MARKETING, CourseTheme.ENTREPRENEURSHIP],
				});
			});

			it('should update multiple fields at once', async () => {
				const updateDto: UpdateCourseDto = {
					title: 'Novo Curso',
					description: 'Nova Descrição',
					themes: [CourseTheme.INNOVATION],
				};

				await useCase.execute(mockCourse.id, updateDto);

				expect(mockCoursesRepository.update).toHaveBeenCalledWith(mockCourse.id, updateDto);
			});

			it('should return UpdateResult with affected count of 1', async () => {
				const updateDto: UpdateCourseDto = { title: 'Updated' };

				const result = await useCase.execute(mockCourse.id, updateDto);

				expect(result.affected).toBe(1);
			});

			it('should verify course existence before update', async () => {
				const updateDto: UpdateCourseDto = { title: 'Updated' };

				await useCase.execute(mockCourse.id, updateDto);

				const getExistingCallOrder = mockGetExistingCourseUseCase.execute.mock.invocationCallOrder[0];
				const updateCallOrder = mockCoursesRepository.update.mock.invocationCallOrder[0];

				expect(getExistingCallOrder).toBeLessThan(updateCallOrder);
			});
		});

		describe('course not found', () => {
			it('should throw NotFoundCourseException when course does not exist', async () => {
				const nonExistentId = 'non-existent-id';
				const updateDto: UpdateCourseDto = { title: 'Updated' };

				mockGetExistingCourseUseCase.execute.mockRejectedValue(new NotFoundCourseException(`id: ${nonExistentId}`));

				await expect(useCase.execute(nonExistentId, updateDto)).rejects.toThrow(NotFoundCourseException);
			});

			it('should not call update when course is not found', async () => {
				const updateDto: UpdateCourseDto = { title: 'Updated' };
				mockGetExistingCourseUseCase.execute.mockRejectedValue(new NotFoundCourseException('id: non-existent-id'));

				await expect(useCase.execute('non-existent-id', updateDto)).rejects.toThrow();

				expect(mockCoursesRepository.update).not.toHaveBeenCalled();
			});

			it('should include course id in error message', async () => {
				const nonExistentId = '0194e7c5-8b7e-7000-8000-999999999999';
				const updateDto: UpdateCourseDto = { title: 'Updated' };

				mockGetExistingCourseUseCase.execute.mockRejectedValue(new NotFoundCourseException(`id: ${nonExistentId}`));

				await expect(useCase.execute(nonExistentId, updateDto)).rejects.toThrow(`Curso não encontrado com os critérios: id: ${nonExistentId}`);
			});
		});

		describe('edge cases', () => {
			it('should handle empty update dto', async () => {
				const emptyUpdateDto: UpdateCourseDto = {};

				mockGetExistingCourseUseCase.execute.mockResolvedValue(mockCourse);
				mockCoursesRepository.update.mockResolvedValue(mockUpdateResult);

				await useCase.execute(mockCourse.id, emptyUpdateDto);

				expect(mockCoursesRepository.update).toHaveBeenCalledWith(mockCourse.id, {});
			});

			it('should handle update with zero affected rows', async () => {
				const zeroAffectedResult: UpdateResult = {
					raw: [],
					affected: 0,
					generatedMaps: [],
				};
				const updateDto: UpdateCourseDto = { title: 'Updated' };

				mockGetExistingCourseUseCase.execute.mockResolvedValue(mockCourse);
				mockCoursesRepository.update.mockResolvedValue(zeroAffectedResult);

				const result = await useCase.execute(mockCourse.id, updateDto);

				expect(result.affected).toBe(0);
			});

			it('should pass the exact courseId to repository update method', async () => {
				const specificId = '0194e7c5-8b7e-7000-8000-123456789abc';
				const updateDto: UpdateCourseDto = { title: 'Updated' };

				mockGetExistingCourseUseCase.execute.mockResolvedValue({
					...mockCourse,
					id: specificId,
				} as unknown as Course);
				mockCoursesRepository.update.mockResolvedValue(mockUpdateResult);

				await useCase.execute(specificId, updateDto);

				expect(mockCoursesRepository.update).toHaveBeenCalledWith(specificId, updateDto);
			});

			it('should update themes to empty array', async () => {
				const updateDto: UpdateCourseDto = { themes: [] };

				mockGetExistingCourseUseCase.execute.mockResolvedValue(mockCourse);
				mockCoursesRepository.update.mockResolvedValue(mockUpdateResult);

				await useCase.execute(mockCourse.id, updateDto);

				expect(mockCoursesRepository.update).toHaveBeenCalledWith(mockCourse.id, { themes: [] });
			});
		});
	});
});
