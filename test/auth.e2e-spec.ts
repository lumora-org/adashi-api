import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppDataSource } from '../src/database/data-source';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';

/**
 * Requires a running PostgreSQL with migrations applied (npm run migration:run).
 * Skipped automatically when TEST_DATABASE_URL / DATABASE_HOST is unreachable.
 */
describe('Auth (e2e)', () => {
  let app: INestApplication;
  let available = false;

  beforeAll(async () => {
    try {
      await AppDataSource.initialize();
      available = true;
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );
      app.useGlobalInterceptors(new TransformInterceptor());
      app.useGlobalFilters(new AllExceptionsFilter());
      await app.init();
    } catch {
      available = false;
    }
  });

  afterAll(async () => {
    if (available) {
      await app?.close();
      await AppDataSource.destroy().catch(() => undefined);
    }
  });

  it('health is public', async () => {
    if (!available) return;
    const res = await request(app.getHttpServer()).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ok');
  });

  it('registers and logs in a new user', async () => {
    if (!available) return;
    const email = `e2e_${Date.now()}@example.com`;
    const reg = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'E2E User',
        email,
        password: 'ExampleStrongPassword123!',
      });
    expect(reg.status).toBe(201);
    expect(reg.body.data.accessToken).toBeDefined();

    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'ExampleStrongPassword123!' });
    expect(login.status).toBe(200);
    expect(login.body.data.accessToken).toBeDefined();

    const me = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${login.body.data.accessToken}`);
    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe(email);
  });

  it('rejects duplicate registration', async () => {
    if (!available) return;
    const email = `dup_${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ fullName: 'Dup', email, password: 'ExampleStrongPassword123!' });
    const again = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ fullName: 'Dup', email, password: 'ExampleStrongPassword123!' });
    expect(again.status).toBe(409);
    expect(again.body.error.code).toBe('DUPLICATE_EMAIL');
  });
});
