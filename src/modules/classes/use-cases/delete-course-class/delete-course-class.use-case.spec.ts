import { Test, type TestingModule } from '@nestjs/testing';
import type { DeleteResult } from 'typeorm';
import { NotFoundClassException } from '../../errors/not-found-class.error';
import type { CourseClass } from '../../models/entities/course-class.entity';
import type { CourseClassesRepositoryInterface } from '../../models/interfaces/course-classes-repository.interface';
import { COURSE_CLASSES_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { CourseClassStatus } from '../../shared/enums/course-class-status.enum';
import { GetExistingCourseClassUseCase } from '../get-existing-course-class/get-existing-class.use-case';
import { DeleteCourseClassUseCase } from './delete-course-class.use-case';

describe('DeleteCourseClassUseCase', () => {
	let useCase: DeleteCourseClassUseCase;
	let mockCourseClassesRepository: jest.Mocked<CourseClassesRepositoryInterface>;
	let mockGetExistingCourseClassUseCase: jest.Mocked<GetExistingCourseClassUseCase>;

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

	const mockDeleteResult: DeleteResult = {
		raw: [],
		affected: 1,
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
				DeleteCourseClassUseCase,
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

		useCase = module.get<DeleteCourseClassUseCase>(DeleteCourseClassUseCase);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		describe('successful deletion', () => {
			beforeEach(() => {
				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(mockCourseClass);
				mockCourseClassesRepository.delete.mockResolvedValue(mockDeleteResult);
			});

			it('should delete a course class successfully', async () => {
				const result = await useCase.execute(mockCourseClass.id);

				expect(mockGetExistingCourseClassUseCase.execute).toHaveBeenCalledWith({ where: { id: mockCourseClass.id } }, { throwIfNotFound: true });
				expect(mockCourseClassesRepository.delete).toHaveBeenCalledWith(mockCourseClass.id);
				expect(result).toEqual(mockDeleteResult);
			});

			it('should verify class exists before deletion', async () => {
				await useCase.execute(mockCourseClass.id);

				const classCheckOrder = mockGetExistingCourseClassUseCase.execute.mock.invocationCallOrder[0];
				const deleteOrder = mockCourseClassesRepository.delete.mock.invocationCallOrder[0];

				expect(classCheckOrder).toBeLessThan(deleteOrder);
			});

			it('should return DeleteResult with affected count of 1', async () => {
				const result = await useCase.execute(mockCourseClass.id);

				expect(result.affected).toBe(1);
			});

			it('should delete class regardless of status', async () => {
				const closedClass: CourseClass = {
					...mockCourseClass,
					status: CourseClassStatus.CLOSED,
				} as unknown as CourseClass;
				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(closedClass);

				await useCase.execute(closedClass.id);

				expect(mockCourseClassesRepository.delete).toHaveBeenCalledWith(closedClass.id);
			});
		});

		describe('class not found', () => {
			it('should throw NotFoundClassException when class does not exist', async () => {
				const nonExistentId = 'non-existent-id';
				mockGetExistingCourseClassUseCase.execute.mockRejectedValue(new NotFoundClassException(`id: ${nonExistentId}`));

				await expect(useCase.execute(nonExistentId)).rejects.toThrow(NotFoundClassException);
			});

			it('should include class id in error message', async () => {
				const nonExistentId = '0194e7c5-8b7e-7000-8000-999999999999';
				mockGetExistingCourseClassUseCase.execute.mockRejectedValue(new NotFoundClassException(`id: ${nonExistentId}`));

				await expect(useCase.execute(nonExistentId)).rejects.toThrow(`Turma não encontrada com os critérios: id: ${nonExistentId}`);
			});

			it('should not delete when class is not found', async () => {
				mockGetExistingCourseClassUseCase.execute.mockRejectedValue(new NotFoundClassException('id: non-existent'));

				await expect(useCase.execute('non-existent')).rejects.toThrow();

				expect(mockCourseClassesRepository.delete).not.toHaveBeenCalled();
			});
		});

		describe('edge cases', () => {
			beforeEach(() => {
				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(mockCourseClass);
			});

			it('should handle deletion with zero affected rows', async () => {
				const zeroAffectedResult: DeleteResult = {
					raw: [],
					affected: 0,
				};
				mockCourseClassesRepository.delete.mockResolvedValue(zeroAffectedResult);

				const result = await useCase.execute(mockCourseClass.id);

				expect(result.affected).toBe(0);
			});

			it('should pass exact class id to repository delete', async () => {
				const specificId = '0194e7c5-8b7e-7000-8000-123456789abc';
				mockGetExistingCourseClassUseCase.execute.mockResolvedValue({
					...mockCourseClass,
					id: specificId,
				} as unknown as CourseClass);
				mockCourseClassesRepository.delete.mockResolvedValue(mockDeleteResult);

				await useCase.execute(specificId);

				expect(mockCourseClassesRepository.delete).toHaveBeenCalledWith(specificId);
			});
		});
	});
});
