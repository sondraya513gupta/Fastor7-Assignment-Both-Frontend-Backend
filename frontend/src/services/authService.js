import api from './api';

/**
 * Register phone number to send OTP
 * @param {string} phone - 10-digit mobile number
 * @param {string} dial_code - e.g. "+91"
 * @returns {Promise<object>} API response
 */
export async function registerUser(phone, dial_code = '+91') {
  const params = new URLSearchParams();
  params.append('phone', phone.trim());
  params.append('dial_code', dial_code.trim());

  const response = await api.post('/v1/pwa/user/register', params.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data;
}

/**
 * Verify OTP and login user
 * @param {string} phone - Mobile number
 * @param {string} otp - 6-digit OTP code
 * @param {string} dial_code - e.g. "+91"
 * @returns {Promise<object>} API response with user and JWT token
 */
export async function loginUser(phone, otp, dial_code = '+91') {
  const params = new URLSearchParams();
  params.append('phone', phone.trim());
  params.append('otp', otp.trim());
  params.append('dial_code', dial_code.trim());

  const response = await api.post('/v1/pwa/user/login', params.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data;
}
