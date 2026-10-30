import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/database.js';

// ─── Test Setup / Teardown ──────────────────────────────────────────────────

let employeeAToken;
let employeeBToken;
let employeeAId;
let employeeBId;

const generateTestEmail = () =>
  `test-enq-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

beforeAll(async () => {
  await prisma.$connect();

  // Create employee A
  const resA = await request(app).post('/api/auth/register').send({
    name: 'Employee A',
    email: generateTestEmail(),
    password: 'SecurePassA1',
  });
  employeeAToken = resA.body.data.token;
  employeeAId = resA.body.data.employee.id;

  // Create employee B
  const resB = await request(app).post('/api/auth/register').send({
    name: 'Employee B',
    email: generateTestEmail(),
    password: 'SecurePassB1',
  });
  employeeBToken = resB.body.data.token;
  employeeBId = resB.body.data.employee.id;
});

afterAll(async () => {
  // Clean up all test data
  await prisma.enquiry.deleteMany({
    where: { email: { contains: 'test-enq-student' } },
  });
  await prisma.employee.deleteMany({
    where: { id: { in: [employeeAId, employeeBId].filter(Boolean) } },
  });
  await prisma.$disconnect();
});

// ─── Helper ─────────────────────────────────────────────────────────────────

const submitEnquiry = (overrides = {}) =>
  request(app)
    .post('/api/enquiries/public')
    .send({
      name: 'Test Student',
      email: `test-enq-student-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
      courseInterest: 'Full Stack Development',
      phone: '9876543210',
      ...overrides,
    });

// ─── Public Enquiry Submission ───────────────────────────────────────────────

describe('POST /api/enquiries/public', () => {
  test('1. Public enquiry can be submitted without authentication', async () => {
    const res = await submitEnquiry();

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.status).toBe('PUBLIC');
  });

  test('2. Newly submitted enquiry has PUBLIC status and null claimedById', async () => {
    const res = await submitEnquiry();

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('PUBLIC');
    expect(res.body.data.claimedById).toBeNull();
  });

  test('3. Missing required field (name) is rejected with 400', async () => {
    const res = await request(app).post('/api/enquiries/public').send({
      email: 'student@example.com',
      courseInterest: 'Web Development',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  test('4. Invalid email format is rejected', async () => {
    const res = await submitEnquiry({ email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('5. Missing courseInterest is rejected', async () => {
    const res = await request(app).post('/api/enquiries/public').send({
      name: 'Student',
      email: 'student@example.com',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('6. Phone field is optional — enquiry without phone succeeds', async () => {
    const res = await request(app).post('/api/enquiries/public').send({
      name: 'Student No Phone',
      email: `test-enq-student-${Date.now()}@example.com`,
      courseInterest: 'Data Science',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

// ─── Fetch Public Enquiries ──────────────────────────────────────────────────

describe('GET /api/enquiries/public', () => {
  test('7. Authenticated employee can fetch public enquiries', async () => {
    const res = await request(app)
      .get('/api/enquiries/public')
      .set('Authorization', `Bearer ${employeeAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toHaveProperty('page');
    expect(res.body.pagination).toHaveProperty('limit');
    expect(res.body.pagination).toHaveProperty('total');
    expect(res.body.pagination).toHaveProperty('totalPages');
  });

  test('8. Unauthenticated request cannot fetch public enquiries (401)', async () => {
    const res = await request(app).get('/api/enquiries/public');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('9. Pagination query parameters are supported', async () => {
    const res = await request(app)
      .get('/api/enquiries/public?page=1&limit=5')
      .set('Authorization', `Bearer ${employeeAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(5);
  });

  test('10. Only PUBLIC enquiries are returned (no CLAIMED ones)', async () => {
    const res = await request(app)
      .get('/api/enquiries/public')
      .set('Authorization', `Bearer ${employeeAToken}`);

    expect(res.status).toBe(200);
    res.body.data.forEach((enquiry) => {
      expect(enquiry.status).toBe('PUBLIC');
      expect(enquiry.claimedById).toBeNull();
    });
  });
});

// ─── Claim Enquiry ───────────────────────────────────────────────────────────

describe('PATCH /api/enquiries/:id/claim', () => {
  let enquiryId;

  beforeEach(async () => {
    // Create a fresh enquiry for each claiming test
    const res = await submitEnquiry();
    enquiryId = res.body.data.id;
  });

  test('11. Employee can claim an available enquiry', async () => {
    const res = await request(app)
      .patch(`/api/enquiries/${enquiryId}/claim`)
      .set('Authorization', `Bearer ${employeeAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('CLAIMED');
    expect(res.body.data.claimedById).toBe(employeeAId);
  });

  test('12. Claimed enquiry disappears from public list', async () => {
    // Claim it
    await request(app)
      .patch(`/api/enquiries/${enquiryId}/claim`)
      .set('Authorization', `Bearer ${employeeAToken}`);

    // Check it's not in the public list
    const publicRes = await request(app)
      .get('/api/enquiries/public')
      .set('Authorization', `Bearer ${employeeAToken}`);

    const found = publicRes.body.data.find((e) => e.id === enquiryId);
    expect(found).toBeUndefined();
  });

  test('13. Claimed enquiry appears in claiming employee private list', async () => {
    // Claim it
    await request(app)
      .patch(`/api/enquiries/${enquiryId}/claim`)
      .set('Authorization', `Bearer ${employeeAToken}`);

    // Check it appears in employee A's private list
    const myRes = await request(app)
      .get('/api/enquiries/my')
      .set('Authorization', `Bearer ${employeeAToken}`);

    const found = myRes.body.data.find((e) => e.id === enquiryId);
    expect(found).toBeDefined();
    expect(found.status).toBe('CLAIMED');
    expect(found.claimedById).toBe(employeeAId);
  });

  test('14. Another employee cannot claim an already claimed enquiry (409)', async () => {
    // Employee A claims it
    await request(app)
      .patch(`/api/enquiries/${enquiryId}/claim`)
      .set('Authorization', `Bearer ${employeeAToken}`);

    // Employee B tries to claim the same enquiry
    const res = await request(app)
      .patch(`/api/enquiries/${enquiryId}/claim`)
      .set('Authorization', `Bearer ${employeeBToken}`);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already been claimed/i);
  });

  test('15. Another employee cannot see claimed enquiry in their private list', async () => {
    // Employee A claims it
    await request(app)
      .patch(`/api/enquiries/${enquiryId}/claim`)
      .set('Authorization', `Bearer ${employeeAToken}`);

    // Employee B's private list should NOT contain the enquiry
    const myRes = await request(app)
      .get('/api/enquiries/my')
      .set('Authorization', `Bearer ${employeeBToken}`);

    const found = myRes.body.data.find((e) => e.id === enquiryId);
    expect(found).toBeUndefined();
  });

  test('16. Invalid enquiry ID returns 404', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app)
      .patch(`/api/enquiries/${fakeId}/claim`)
      .set('Authorization', `Bearer ${employeeAToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('17. Unauthenticated claim attempt is rejected (401)', async () => {
    const res = await request(app).patch(`/api/enquiries/${enquiryId}/claim`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── Concurrency Test ────────────────────────────────────────────────────────

describe('Concurrency: Simultaneous claim attempts', () => {
  test('18. Exactly one claim succeeds when two employees claim simultaneously', async () => {
    // Create a fresh enquiry
    const enquiryRes = await submitEnquiry();
    const enquiryId = enquiryRes.body.data.id;

    // Fire both requests simultaneously
    const [resA, resB] = await Promise.all([
      request(app)
        .patch(`/api/enquiries/${enquiryId}/claim`)
        .set('Authorization', `Bearer ${employeeAToken}`),
      request(app)
        .patch(`/api/enquiries/${enquiryId}/claim`)
        .set('Authorization', `Bearer ${employeeBToken}`),
    ]);

    const statuses = [resA.status, resB.status];

    // Exactly one should succeed
    expect(statuses.filter((s) => s === 200).length).toBe(1);
    // Exactly one should fail
    expect(statuses.filter((s) => s === 409).length).toBe(1);

    // Verify the enquiry is claimed by exactly one employee
    const enquiry = await prisma.enquiry.findUnique({ where: { id: enquiryId } });
    expect(enquiry.status).toBe('CLAIMED');
    expect(enquiry.claimedById).not.toBeNull();
    expect([employeeAId, employeeBId]).toContain(enquiry.claimedById);
  });
});

// ─── Private Enquiries ───────────────────────────────────────────────────────

describe('GET /api/enquiries/my', () => {
  test('19. Authenticated employee fetches only their own enquiries', async () => {
    const res = await request(app)
      .get('/api/enquiries/my')
      .set('Authorization', `Bearer ${employeeAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    // All returned enquiries must belong to employee A
    res.body.data.forEach((enquiry) => {
      expect(enquiry.claimedById).toBe(employeeAId);
      expect(enquiry.status).toBe('CLAIMED');
    });
  });

  test('20. Unauthenticated request cannot access private enquiries (401)', async () => {
    const res = await request(app).get('/api/enquiries/my');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('21. Private enquiries include pagination metadata', async () => {
    const res = await request(app)
      .get('/api/enquiries/my?page=1&limit=5')
      .set('Authorization', `Bearer ${employeeAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('page', 1);
    expect(res.body.pagination).toHaveProperty('limit', 5);
    expect(res.body.pagination).toHaveProperty('total');
    expect(res.body.pagination).toHaveProperty('totalPages');
  });
});

// ─── Database Integrity Tests ────────────────────────────────────────────────

describe('Database integrity', () => {
  test('22. Enquiry foreign key relationship is valid', async () => {
    const enqRes = await submitEnquiry();
    const enquiryId = enqRes.body.data.id;

    await request(app)
      .patch(`/api/enquiries/${enquiryId}/claim`)
      .set('Authorization', `Bearer ${employeeAToken}`);

    const enquiry = await prisma.enquiry.findUnique({
      where: { id: enquiryId },
      include: { claimedBy: true },
    });

    expect(enquiry.claimedBy).not.toBeNull();
    expect(enquiry.claimedBy.id).toBe(employeeAId);
  });

  test('23. Employee unique email constraint is enforced at DB level', async () => {
    const email = generateTestEmail();
    const hashedPassword = '$2b$12$abc123'; // fake hash for direct DB insertion

    await prisma.employee.create({ data: { name: 'Test', email, password: hashedPassword } });

    await expect(
      prisma.employee.create({ data: { name: 'Test2', email, password: hashedPassword } })
    ).rejects.toThrow();
  });
});
