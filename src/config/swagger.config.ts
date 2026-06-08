import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export default class SwaggerConfig {
    public static setup = (app: INestApplication): void => {
        const configService: ConfigService = app.get(ConfigService);
        const config = new DocumentBuilder()
            .setTitle('Project')
            .setDescription('The Project API description')
            .setVersion(`version ${configService.get<string>('VERSION')}`)
            .addBearerAuth({
                type: 'http',
                scheme: 'Bearer',
                bearerFormat: 'JWT',
                in: 'header',
            }, 'access-token')
            .addSecurityRequirements('access-token')
            .build();
        const documentFactory = () => SwaggerModule.createDocument(app, config, {
            deepScanRoutes: false,
        });

        const exportJson = configService.get<string>('EXPORT_SWAGGER_API_JSON') === 'true';
        if (exportJson) {
            const document = documentFactory();
            const outputDir = join(process.cwd(), 'docs_API');
            mkdirSync(outputDir, { recursive: true });
            writeFileSync(join(outputDir, 'swagger.json'), JSON.stringify(document, null, 2));
            console.log('Swagger JSON exported to docs_API/swagger.json');
        }

        SwaggerModule.setup('swagger', app, documentFactory, {
            swaggerOptions: {
                persistAuthorization: true,
            },
            jsonDocumentUrl: '/swagger-json', /* This is the default URL for the JSON document, but we can customize it if needed */
            yamlDocumentUrl: '/swagger-yaml', /* This is the default URL for the YAML document, but we can customize it if needed */
        });
    }
}