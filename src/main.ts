import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import ConfigSwagger from '@/config/swagger.config';
import cookieParser from 'cookie-parser';
import { setupCors } from '@/config/cors.config';
import { validationConfig } from '@/config/validation.config';
import { setupAppConfig } from '@/config/app.config';

async function bootstrap() {
  const app: NestExpressApplication = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService: ConfigService = app.get(ConfigService);

  if (configService.get<string>('MODE') === 'development') {
    ConfigSwagger.setup(app);
    console.log('Swagger documentation is enabled in development mode');
  };

  // setup the versioning and global prefix for all routes
  const { globalPrefix, version } = setupAppConfig(app);

  // Custom Validation Pipe with error formatting and automatic transformation
  validationConfig(app);

  // Add cookie-parser middleware to handle cookies in requests and responses, which is essential for managing refresh tokens stored in cookies.
  app.use(cookieParser());

  // Call the CORS setup function to configure CORS for the application
  setupCors(app);


  await app.listen(configService.get<number>('PORT') ?? 3000).then(() => {
    console.log(`Application is running on: http://${configService.get<string>('HOST')}:${configService.get<number>('PORT')}/${globalPrefix}/v${version}`);
    console.log(
      `Swagger is running on: http://${configService.get<string>('HOST')}:${configService.get<number>('PORT')}/swagger`,
    );
  });
}
bootstrap();
