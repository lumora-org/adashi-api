import { envValidationSchema } from '../config/env.validation';

describe('envValidationSchema', () => {
  const base = {
    NODE_ENV: 'development',
    JWT_ACCESS_SECRET: 'a'.repeat(32),
    JWT_REFRESH_SECRET: 'b'.repeat(32),
  };

  it('accepts a minimal development environment', () => {
    const { error } = envValidationSchema.validate(base);
    expect(error).toBeUndefined();
  });

  it('requires long secrets in production', () => {
    const { error } = envValidationSchema.validate({
      ...base,
      NODE_ENV: 'production',
      JWT_ACCESS_SECRET: 'short',
      JWT_REFRESH_SECRET: 'short',
    });
    expect(error).toBeDefined();
  });

  it('rejects invalid NODE_ENV', () => {
    const { error } = envValidationSchema.validate({
      ...base,
      NODE_ENV: 'staging',
    });
    expect(error).toBeDefined();
  });
});
