import { Test, type TestingModule } from '@nestjs/testing';
import type { CreateCourseDto } from '../../models/dto/input/create-course.dto';
import type { Course } from '../../models/entities/course.entity';
import type { CoursesRepositoryInterface } from '../../models/interfaces/courses-repository.interface';
import { COURSE_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { CourseTheme } from '../../shared/enums/course-theme.enum';
import { CreateCourseUseCase } from './create-course.use-case';

describe('CreateCourseUseCase', () => {
	let useCase: CreateCourseUseCase;
	let mockCoursesRepository: jest.Mocked<CoursesRepositoryInterface>;

	const mockCourse: Course = {
		id: '0194e7c5-8b7e-7000-8000-000000000001',
		title: 'Curso de TypeScript',
		description: 'Aprenda TypeScript do zero ao avançado',
		image_url: 'https://example.com/typescript.png',
		themes: [CourseTheme.TECHNOLOGY, CourseTheme.INNOVATION],
		classes: [],
		created_at: new Date('2024-01-01'),
		updated_at: new Date('2024-01-01'),
	} as unknown as Course;

	const createCourseDto: CreateCourseDto = {
		title: 'Curso de TypeScript',
		description: 'Aprenda TypeScript do zero ao avançado',
		image_url: 'https://example.com/typescript.png',
		themes: [CourseTheme.TECHNOLOGY, CourseTheme.INNOVATION],
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

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CreateCourseUseCase,
				{
					provide: COURSE_REPOSITORY_INTERFACE_KEY,
					useValue: mockCoursesRepository,
				},
			],
		}).compile();

		useCase = module.get<CreateCourseUseCase>(CreateCourseUseCase);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		describe('successful creation', () => {
			beforeEach(() => {
				mockCoursesRepository.create.mockReturnValue(mockCourse);
				mockCoursesRepository.save.mockResolvedValue(mockCourse);
			});

			it('should create a new course successfully', async () => {
				const result = await useCase.execute(createCourseDto);

				expect(mockCoursesRepository.create).toHaveBeenCalledWith(createCourseDto);
				expect(mockCoursesRepository.save).toHaveBeenCalledWith(mockCourse);
				expect(result).toEqual(mockCourse);
			});

			it('should return the created course with all properties', async () => {
				const result = await useCase.execute(createCourseDto);

				expect(result).toHaveProperty('id');
				expect(result).toHaveProperty('title', createCourseDto.title);
				expect(result).toHaveProperty('description', createCourseDto.description);
				expect(result).toHaveProperty('image_url', createCourseDto.image_url);
				expect(result).toHaveProperty('themes');
				expect(result).toHaveProperty('created_at');
				expect(result).toHaveProperty('updated_at');
			});

			it('should create course with multiple themes', async () => {
				const multiThemeDto: CreateCourseDto = {
					...createCourseDto,
					themes: [CourseTheme.TECHNOLOGY, CourseTheme.INNOVATION, CourseTheme.ENTREPRENEURSHIP],
				};
				const multiThemeCourse: Course = {
					...mockCourse,
					themes: multiThemeDto.themes,
				} as unknown as Course;

				mockCoursesRepository.create.mockReturnValue(multiThemeCourse);
				mockCoursesRepository.save.mockResolvedValue(multiThemeCourse);

				const result = await useCase.execute(multiThemeDto);

				expect(result.themes).toHaveLength(3);
				expect(result.themes).toContain(CourseTheme.TECHNOLOGY);
				expect(result.themes).toContain(CourseTheme.INNOVATION);
				expect(result.themes).toContain(CourseTheme.ENTREPRENEURSHIP);
			});

			it('should create course with single theme', async () => {
				const singleThemeDto: CreateCourseDto = {
					...createCourseDto,
					themes: [CourseTheme.AGRICULTURE],
				};
				const singleThemeCourse: Course = {
					...mockCourse,
					themes: singleThemeDto.themes,
				} as unknown as Course;

				mockCoursesRepository.create.mockReturnValue(singleThemeCourse);
				mockCoursesRepository.save.mockResolvedValue(singleThemeCourse);

				const result = await useCase.execute(singleThemeDto);

				expect(result.themes).toHaveLength(1);
				expect(result.themes).toContain(CourseTheme.AGRICULTURE);
			});

			it('should create course with empty themes array', async () => {
				const emptyThemesDto: CreateCourseDto = {
					...createCourseDto,
					themes: [],
				};
				const emptyThemesCourse: Course = {
					...mockCourse,
					themes: [],
				} as unknown as Course;

				mockCoursesRepository.create.mockReturnValue(emptyThemesCourse);
				mockCoursesRepository.save.mockResolvedValue(emptyThemesCourse);

				const result = await useCase.execute(emptyThemesDto);

				expect(result.themes).toHaveLength(0);
			});
		});

		describe('theme variations', () => {
			beforeEach(() => {
				mockCoursesRepository.create.mockReturnValue(mockCourse);
				mockCoursesRepository.save.mockResolvedValue(mockCourse);
			});

			it('should accept INNOVATION theme', async () => {
				const dto: CreateCourseDto = { ...createCourseDto, themes: [CourseTheme.INNOVATION] };
				const course: Course = { ...mockCourse, themes: dto.themes } as unknown as Course;

				mockCoursesRepository.create.mockReturnValue(course);
				mockCoursesRepository.save.mockResolvedValue(course);

				const result = await useCase.execute(dto);

				expect(result.themes).toContain(CourseTheme.INNOVATION);
			});

			it('should accept TECHNOLOGY theme', async () => {
				const dto: CreateCourseDto = { ...createCourseDto, themes: [CourseTheme.TECHNOLOGY] };
				const course: Course = { ...mockCourse, themes: dto.themes } as unknown as Course;

				mockCoursesRepository.create.mockReturnValue(course);
				mockCoursesRepository.save.mockResolvedValue(course);

				const result = await useCase.execute(dto);

				expect(result.themes).toContain(CourseTheme.TECHNOLOGY);
			});

			it('should accept MARKETING theme', async () => {
				const dto: CreateCourseDto = { ...createCourseDto, themes: [CourseTheme.MARKETING] };
				const course: Course = { ...mockCourse, themes: dto.themes } as unknown as Course;

				mockCoursesRepository.create.mockReturnValue(course);
				mockCoursesRepository.save.mockResolvedValue(course);

				const result = await useCase.execute(dto);

				expect(result.themes).toContain(CourseTheme.MARKETING);
			});

			it('should accept ENTREPRENEURSHIP theme', async () => {
				const dto: CreateCourseDto = { ...createCourseDto, themes: [CourseTheme.ENTREPRENEURSHIP] };
				const course: Course = { ...mockCourse, themes: dto.themes } as unknown as Course;

				mockCoursesRepository.create.mockReturnValue(course);
				mockCoursesRepository.save.mockResolvedValue(course);

				const result = await useCase.execute(dto);

				expect(result.themes).toContain(CourseTheme.ENTREPRENEURSHIP);
			});

			it('should accept AGRICULTURE theme', async () => {
				const dto: CreateCourseDto = { ...createCourseDto, themes: [CourseTheme.AGRICULTURE] };
				const course: Course = { ...mockCourse, themes: dto.themes } as unknown as Course;

				mockCoursesRepository.create.mockReturnValue(course);
				mockCoursesRepository.save.mockResolvedValue(course);

				const result = await useCase.execute(dto);

				expect(result.themes).toContain(CourseTheme.AGRICULTURE);
			});

			it('should accept all themes combined', async () => {
				const allThemes = [
					CourseTheme.INNOVATION,
					CourseTheme.TECHNOLOGY,
					CourseTheme.MARKETING,
					CourseTheme.ENTREPRENEURSHIP,
					CourseTheme.AGRICULTURE,
				];
				const dto: CreateCourseDto = { ...createCourseDto, themes: allThemes };
				const course: Course = { ...mockCourse, themes: allThemes } as unknown as Course;

				mockCoursesRepository.create.mockReturnValue(course);
				mockCoursesRepository.save.mockResolvedValue(course);

				const result = await useCase.execute(dto);

				expect(result.themes).toHaveLength(5);
			});
		});
	});
});
