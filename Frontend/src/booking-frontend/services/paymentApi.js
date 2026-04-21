import axios from 'axios';
import { getGatewayBaseUrl } from '../../lib/gateway';

/**
 * POST /payments — the endpoint itself is permitAll, but we still forward the
 * user's Bearer token (when present) so payment-service can call user-service's
 * role-protected GET /users/{id} to verify the registered user.
 */
export async function createPayment(payload) {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await axios.post(`${getGatewayBaseUrl()}/payments`, payload, { headers });
  return response.data;
}

/** @deprecated alias — prefer createPayment */
export async function processPayment(payload) {
  return createPayment(payload);
}
