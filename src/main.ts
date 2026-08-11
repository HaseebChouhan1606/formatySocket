import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS — Next.js frontend se connection allow karo
  app.enableCors({
    origin: '*', // Production mein apni Vercel URL lagana
    methods: ['GET', 'POST'],
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`✅ WebSocket server running on port ${port}`);
}
bootstrap();
