import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

const favIcon =
	'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM3MDRkZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1ncmFkdWF0aW9uLWNhcC1pY29uIGx1Y2lkZS1ncmFkdWF0aW9uLWNhcCI+PHBhdGggZD0iTTIxLjQyIDEwLjkyMmExIDEgMCAwIDAtLjAxOS0xLjgzOEwxMi44MyA1LjE4YTIgMiAwIDAgMC0xLjY2IDBMMi42IDkuMDhhMSAxIDAgMCAwIDAgMS44MzJsOC41NyAzLjkwOGEyIDIgMCAwIDAgMS42NiAweiIvPjxwYXRoIGQ9Ik0yMiAxMHY2Ii8+PHBhdGggZD0iTTYgMTIuNVYxNmE2IDMgMCAwIDAgMTIgMHYtMy41Ii8+PC9zdmc+';
export function setupDocumentationConfig(app: INestApplication) {
	const config = new DocumentBuilder().setTitle(`School API`).setDescription(`The School API description`).setVersion(`1.0`).addBearerAuth().build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup(`api/swagger/reference`, app, document, {
		swaggerOptions: {
			customfavIcon: favIcon,
			persistAuthorization: true,
		},
		customfavIcon: favIcon,
		customSiteTitle: 'API / School',
	});

	app.use('/api/scalar/reference', apiReference({ content: document }));
}
