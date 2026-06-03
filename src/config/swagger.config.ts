import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export default class ConfigSwagger {
    public static setup = (app: NestExpressApplication): void => {
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
        });
    }
}