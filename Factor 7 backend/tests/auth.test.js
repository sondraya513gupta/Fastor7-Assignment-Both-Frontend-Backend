import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/database.js';
import bcrypt from 'bcryptjs';

// ─── Test Setup / Teardown ──────────────────────────────────────────────────

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  // Clean up test data
  await prisma.enquiry.deleteMany({
    where: { email: { contains: 'test-auth' } },
  });
  await prisma.employee.deleteMany({
    where: { email: { contains: 'test-auth' } },
  });
  await prisma.$disconnect();
});

// ─── Helper ─────────────────────────────────────────────────────────────────

const generateTestEmail = () =>
  `test-auth-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

// ─── Registration Tests ──────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  test('1. Employee registration succeeds with valid data', async () => {
    const email = generateTestEmail();
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Employee',
      email,
      password: 'SecurePass123',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('employee');
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.employee.email).toBe(email);
    expect(res.body.data.employee).not.toHaveProperty('password');
  });

  test('2. Duplicate email registration fails with 409', async () => {
    const email = generateTestEmail();

    // Register once
    await request(app).post('/api/auth/register').send({
      name: 'First Employee',
      email,
      password: 'SecurePass123',
    });

    // Try again with same email
    const res = await request(app).post('/api/auth/register').send({
      name: 'Second Employee',
      email,
      password: 'AnotherPass456',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('3. Invalid email format is rejected with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Employee',
      email: 'not-a-valid-email',
      password: 'SecurePass123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  test('4. Weak password is rejected (no uppercase)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Employee',
      email: generateTestEmail(),
      password: 'weakpassword1',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('5. Short password is rejected', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Employee',
      email: generateTestEmail(),
      password: 'Ab1',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('6. Missing name field is rejected', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: generateTestEmail(),
      password: 'SecurePass123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('7. Password is stored as a hash (not plain text)', async () => {
    const email = generateTestEmail();
    const password = 'SecurePass123';

    await request(app).post('/api/auth/register').send({
      name: 'Hash Test Employee',
      email,
      password,
    });

    // Directly query the database
    const employee = await prisma.employee.findUnique({ where: { email } });
    expect(employee).not.toBeNull();
    expect(employee.password).not.toBe(password);

    // Verify it's a valid bcrypt hash
    const isHashed = await bcrypt.compare(password, employee.password);
    expect(isHashed).toBe(true);
  });
});

// ─── Login Tests ─────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  let testEmail;
  const testPassword = 'SecurePass123';

  beforeAll(async () => {
    testEmail = generateTestEmail();
    await request(app).post('/api/auth/register').send({
      name: 'Login Test Employee',
      email: testEmail,
      password: testPassword,
    });
  });

  test('8. Employee login succeeds with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: testPassword,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.employee.email).toBe(testEmail);
    expect(res.body.data.employee).not.toHaveProperty('password');
  });

  test('9. Incorrect password fails with 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'WrongPassword99',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('10. Non-existent email fails with 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@nowhere.com',
      password: 'SecurePass123',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('11. JWT token is generated and returned on successful login', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: testPassword,
    });

    expect(res.status).toBe(200);
    const token = res.body.data.token;
    expect(typeof token).toBe('string');

    // Verify it's a valid JWT format (3 parts)
    const parts = token.split('.');
    expect(parts.length).toBe(3);
  });

  test('12. Invalid JWT is rejected by protected endpoints', async () => {
    const res = await request(app)
      .get('/api/enquiries/public')
      .set('Authorization', 'Bearer invalid.jwt.token');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('13. Missing token is rejected by protected endpoints', async () => {
    const res = await request(app).get('/api/enquiries/public');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
