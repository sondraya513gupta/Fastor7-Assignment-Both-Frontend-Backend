import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { generateToken } from '../utils/jwt.js';

const SALT_ROUNDS = 12;

/**
 * Register a new employee
 * @param {object} data - Registration data
 * @param {string} data.name
 * @param {string} data.email
 * @param {string} data.password
 * @returns {object} Created employee (without password) and JWT token
 */
export const registerEmployee = async ({ name, email, password }) => {
  // Check for duplicate email
  const existingEmployee = await prisma.employee.findUnique({
    where: { email },
  });

  if (existingEmployee) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    throw error;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Create employee in the database
  const employee = await prisma.employee.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const token = generateToken(employee.id);

  return { employee, token };
};

/**
 * Login an employee
 * @param {object} data - Login credentials
 * @param {string} data.email
 * @param {string} data.password
 * @returns {object} Employee (without password) and JWT token
 */
export const loginEmployee = async ({ email, password }) => {
  // Find employee by email (include password for comparison)
  const employee = await prisma.employee.findUnique({
    where: { email },
  });

  if (!employee) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, employee.password);

  if (!isPasswordValid) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  // Generate JWT token
  const token = generateToken(employee.id);

  // Return employee data without password
  const { password: _password, ...employeeData } = employee;

  return { employee: employeeData, token };
};
