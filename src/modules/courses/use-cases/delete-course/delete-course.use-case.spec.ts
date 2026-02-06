import { Test, type TestingModule } from '@nestjs/testing';
import type { DeleteResult } from 'typeorm';
import { NotFoundCourseException } from '../../errors/not-found-course.error';
import type { Course } from '../../models/entities/course.entity';
import type { CoursesRepositoryInterface } from '../../models/interfaces/courses-repository.interface';
import { COURSE_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { CourseTheme } from '../../shared/enums/course-theme.enum';
import { GetExistingCourseUseCase } from '../get-existing-course/get-existing-course.use-case';
import { DeleteCourseUseCase } from './delete-course.use-case';

describe('DeleteCourseUseCase', () => {
	let useCase: DeleteCourseUseCase;
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

	const mockDeleteResult: DeleteResult = {
		raw: [],
		affected: 1,
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
				DeleteCourseUseCase,
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

		useCase = module.get<DeleteCourseUseCase>(DeleteCourseUseCase);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		describe('successful deletion', () => {
			beforeEach(() => {
				mockGetExistingCourseUseCase.execute.mockResolvedValue(mockCourse);
				mockCoursesRepository.delete.mockResolvedValue(mockDeleteResult);
			});

			it('should delete an existing course successfully', async () => {
				const result = await useCase.execute(mockCourse.id);

				expect(mockGetExistingCourseUseCase.execute).toHaveBeenCalledWith({ where: { id: mockCourse.id } }, { throwIfNotFound: true });
				expect(mockCoursesRepository.delete).toHaveBeenCalledWith(mockCourse.id);
				expect(result).toEqual(mockDeleteResult);
			});

			it('should return DeleteResult with affected count of 1', async () => {
				const result = await useCase.execute(mockCourse.id);

				expect(result.affected).toBe(1);
			});

			it('should verify course existence before deletion', async () => {
				await useCase.execute(mockCourse.id);

				const getExistingCallOrder = mockGetExistingCourseUseCase.execute.mock.invocationCallOrder[0];
				const deleteCallOrder = mockCoursesRepository.delete.mock.invocationCallOrder[0];

				expect(getExistingCallOrder).toBeLessThan(deleteCallOrder);
			});
		});

		describe('course not found', () => {
			it('should throw NotFoundCourseException when course does not exist', async () => {
				const nonExistentId = 'non-existent-id';
				mockGetExistingCourseUseCase.execute.mockRejectedValue(new NotFoundCourseException(`id: ${nonExistentId}`));

				await expect(useCase.execute(nonExistentId)).rejects.toThrow(NotFoundCourseException);
			});

			it('should not call delete when course is not found', async () => {
				mockGetExistingCourseUseCase.execute.mockRejectedValue(new NotFoundCourseException('id: non-existent-id'));

				await expect(useCase.execute('non-existent-id')).rejects.toThrow();

				expect(mockCoursesRepository.delete).not.toHaveBeenCalled();
			});

			it('should include course id in error message', async () => {
				const nonExistentId = '0194e7c5-8b7e-7000-8000-999999999999';
				mockGetExistingCourseUseCase.execute.mockRejectedValue(new NotFoundCourseException(`id: ${nonExistentId}`));

				await expect(useCase.execute(nonExistentId)).rejects.toThrow(`Curso não encontrado com os critérios: id: ${nonExistentId}`);
			});
		});

		describe('edge cases', () => {
			it('should handle deletion with zero affected rows', async () => {
				const zeroAffectedResult: DeleteResult = {
					raw: [],
					affected: 0,
				};

				mockGetExistingCourseUseCase.execute.mockResolvedValue(mockCourse);
				mockCoursesRepository.delete.mockResolvedValue(zeroAffectedResult);

				const result = await useCase.execute(mockCourse.id);

				expect(result.affected).toBe(0);
			});

			it('should pass the exact courseId to repository delete method', async () => {
				const specificId = '0194e7c5-8b7e-7000-8000-123456789abc';
				mockGetExistingCourseUseCase.execute.mockResolvedValue({
					...mockCourse,
					id: specificId,
				} as unknown as Course);
				mockCoursesRepository.delete.mockResolvedValue(mockDeleteResult);

				await useCase.execute(specificId);

				expect(mockCoursesRepository.delete).toHaveBeenCalledWith(specificId);
			});
		});
	});
});
