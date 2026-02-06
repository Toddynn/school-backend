import { Test, type TestingModule } from '@nestjs/testing';
import type { UpdateResult } from 'typeorm';
import { NotFoundCourseException } from '@/modules/courses/errors/not-found-course.error';
import { GetExistingCourseUseCase } from '@/modules/courses/use-cases/get-existing-course/get-existing-course.use-case';
import { NotFoundClassException } from '../../errors/not-found-class.error';
import type { UpdateCourseClassDto } from '../../models/dto/input/update-course-class.dto';
import type { CourseClass } from '../../models/entities/course-class.entity';
import type { CourseClassesRepositoryInterface } from '../../models/interfaces/course-classes-repository.interface';
import { COURSE_CLASSES_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { CourseClassStatus } from '../../shared/enums/course-class-status.enum';
import { GetExistingCourseClassUseCase } from '../get-existing-course-class/get-existing-class.use-case';
import { UpdateCourseClassUseCase } from './update-course-class.use-case';

describe('UpdateCourseClassUseCase', () => {
	let useCase: UpdateCourseClassUseCase;
	let mockCourseClassesRepository: jest.Mocked<CourseClassesRepositoryInterface>;
	let mockGetExistingCourseClassUseCase: jest.Mocked<GetExistingCourseClassUseCase>;
	let mockGetExistingCourseUseCase: jest.Mocked<GetExistingCourseUseCase>;

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

		mockGetExistingCourseUseCase = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<GetExistingCourseUseCase>;

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UpdateCourseClassUseCase,
				{
					provide: COURSE_CLASSES_REPOSITORY_INTERFACE_KEY,
					useValue: mockCourseClassesRepository,
				},
				{
					provide: GetExistingCourseClassUseCase,
					useValue: mockGetExistingCourseClassUseCase,
				},
				{
					provide: GetExistingCourseUseCase,
					useValue: mockGetExistingCourseUseCase,
				},
			],
		}).compile();

		useCase = module.get<UpdateCourseClassUseCase>(UpdateCourseClassUseCase);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		describe('successful update', () => {
			beforeEach(() => {
				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(mockCourseClass);
				mockCourseClassesRepository.update.mockResolvedValue(mockUpdateResult);
			});

			it('should update a course class successfully', async () => {
				const updateDto: UpdateCourseClassDto = { title: 'Turma Atualizada' };

				const result = await useCase.execute(mockCourseClass.id, updateDto);

				expect(mockGetExistingCourseClassUseCase.execute).toHaveBeenCalledWith({ where: { id: mockCourseClass.id } }, { throwIfNotFound: true });
				expect(mockCourseClassesRepository.update).toHaveBeenCalledWith(mockCourseClass.id, updateDto);
				expect(result).toEqual(mockUpdateResult);
			});

			it('should verify class exists before updating', async () => {
				const updateDto: UpdateCourseClassDto = { title: 'Turma Atualizada' };

				await useCase.execute(mockCourseClass.id, updateDto);

				const classCheckOrder = mockGetExistingCourseClassUseCase.execute.mock.invocationCallOrder[0];
				const updateOrder = mockCourseClassesRepository.update.mock.invocationCallOrder[0];

				expect(classCheckOrder).toBeLessThan(updateOrder);
			});

			it('should update title only', async () => {
				const updateDto: UpdateCourseClassDto = { title: 'Novo Título' };

				await useCase.execute(mockCourseClass.id, updateDto);

				expect(mockCourseClassesRepository.update).toHaveBeenCalledWith(mockCourseClass.id, {
					title: 'Novo Título',
				});
			});

			it('should update description only', async () => {
				const updateDto: UpdateCourseClassDto = { description: 'Nova descrição' };

				await useCase.execute(mockCourseClass.id, updateDto);

				expect(mockCourseClassesRepository.update).toHaveBeenCalledWith(mockCourseClass.id, {
					description: 'Nova descrição',
				});
			});

			it('should update spots only', async () => {
				const updateDto: UpdateCourseClassDto = { spots: 50 };

				await useCase.execute(mockCourseClass.id, updateDto);

				expect(mockCourseClassesRepository.update).toHaveBeenCalledWith(mockCourseClass.id, {
					spots: 50,
				});
			});

			it('should update status from AVAILABLE to CLOSED', async () => {
				const updateDto: UpdateCourseClassDto = { status: CourseClassStatus.CLOSED };

				await useCase.execute(mockCourseClass.id, updateDto);

				expect(mockCourseClassesRepository.update).toHaveBeenCalledWith(mockCourseClass.id, {
					status: CourseClassStatus.CLOSED,
				});
			});

			it('should update multiple fields at once', async () => {
				const updateDto: UpdateCourseClassDto = {
					title: 'Turma Atualizada',
					description: 'Nova descrição',
					spots: 40,
					status: CourseClassStatus.CLOSED,
				};

				await useCase.execute(mockCourseClass.id, updateDto);

				expect(mockCourseClassesRepository.update).toHaveBeenCalledWith(mockCourseClass.id, updateDto);
			});

			it('should update dates', async () => {
				const newStartDate = new Date('2024-03-01');
				const newEndDate = new Date('2024-09-30');
				const updateDto: UpdateCourseClassDto = {
					start_date: newStartDate,
					end_date: newEndDate,
				};

				await useCase.execute(mockCourseClass.id, updateDto);

				expect(mockCourseClassesRepository.update).toHaveBeenCalledWith(mockCourseClass.id, {
					start_date: newStartDate,
					end_date: newEndDate,
				});
			});
		});

		describe('update course_id', () => {
			beforeEach(() => {
				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(mockCourseClass);
				mockCourseClassesRepository.update.mockResolvedValue(mockUpdateResult);
			});

			it('should verify new course exists when updating course_id', async () => {
				const newCourseId = '0194e7c5-8b7e-7000-8000-000000000020';
				const updateDto: UpdateCourseClassDto = { course_id: newCourseId };

				mockGetExistingCourseUseCase.execute.mockResolvedValue({} as never);

				await useCase.execute(mockCourseClass.id, updateDto);

				expect(mockGetExistingCourseUseCase.execute).toHaveBeenCalledWith({ where: { id: newCourseId } }, { throwIfNotFound: true });
			});

			it('should not verify course when course_id is not in update dto', async () => {
				const updateDto: UpdateCourseClassDto = { title: 'Turma Atualizada' };

				await useCase.execute(mockCourseClass.id, updateDto);

				expect(mockGetExistingCourseUseCase.execute).not.toHaveBeenCalled();
			});

			it('should not verify course when course_id is undefined', async () => {
				const updateDto: UpdateCourseClassDto = { course_id: undefined, title: 'Test' };

				await useCase.execute(mockCourseClass.id, updateDto);

				expect(mockGetExistingCourseUseCase.execute).not.toHaveBeenCalled();
			});

			it('should throw NotFoundCourseException when new course does not exist', async () => {
				const newCourseId = '0194e7c5-8b7e-7000-8000-nonexistent';
				const updateDto: UpdateCourseClassDto = { course_id: newCourseId };

				mockGetExistingCourseUseCase.execute.mockRejectedValue(new NotFoundCourseException(`id: ${newCourseId}`));

				await expect(useCase.execute(mockCourseClass.id, updateDto)).rejects.toThrow(NotFoundCourseException);
			});

			it('should not update when new course is not found', async () => {
				const newCourseId = '0194e7c5-8b7e-7000-8000-nonexistent';
				const updateDto: UpdateCourseClassDto = { course_id: newCourseId };

				mockGetExistingCourseUseCase.execute.mockRejectedValue(new NotFoundCourseException(`id: ${newCourseId}`));

				await expect(useCase.execute(mockCourseClass.id, updateDto)).rejects.toThrow();

				expect(mockCourseClassesRepository.update).not.toHaveBeenCalled();
			});
		});

		describe('class not found', () => {
			it('should throw NotFoundClassException when class does not exist', async () => {
				const nonExistentId = 'non-existent-id';
				mockGetExistingCourseClassUseCase.execute.mockRejectedValue(new NotFoundClassException(`id: ${nonExistentId}`));

				await expect(useCase.execute(nonExistentId, { title: 'Test' })).rejects.toThrow(NotFoundClassException);
			});

			it('should include class id in error message', async () => {
				const nonExistentId = '0194e7c5-8b7e-7000-8000-999999999999';
				mockGetExistingCourseClassUseCase.execute.mockRejectedValue(new NotFoundClassException(`id: ${nonExistentId}`));

				await expect(useCase.execute(nonExistentId, { title: 'Test' })).rejects.toThrow(
					`Turma não encontrada com os critérios: id: ${nonExistentId}`,
				);
			});

			it('should not update when class is not found', async () => {
				mockGetExistingCourseClassUseCase.execute.mockRejectedValue(new NotFoundClassException('id: non-existent'));

				await expect(useCase.execute('non-existent', { title: 'Test' })).rejects.toThrow();

				expect(mockCourseClassesRepository.update).not.toHaveBeenCalled();
			});
		});

		describe('edge cases', () => {
			beforeEach(() => {
				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(mockCourseClass);
				mockCourseClassesRepository.update.mockResolvedValue(mockUpdateResult);
			});

			it('should handle empty update dto', async () => {
				const updateDto: UpdateCourseClassDto = {};

				await useCase.execute(mockCourseClass.id, updateDto);

				expect(mockCourseClassesRepository.update).toHaveBeenCalledWith(mockCourseClass.id, {});
			});

			it('should return UpdateResult with affected count', async () => {
				const updateDto: UpdateCourseClassDto = { title: 'Test' };

				const result = await useCase.execute(mockCourseClass.id, updateDto);

				expect(result.affected).toBe(1);
			});
		});
	});
});
