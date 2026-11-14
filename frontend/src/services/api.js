/** Shared API transport and readable errors; no business logic in page components. */
export class ApiError extends Error {
  constructor(message, status = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, signal, baseUrl = '' } = {}) {
  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method, signal,
      headers: body === undefined ? { Accept: 'application/json' } : { Accept: 'application/json', 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new ApiError('Cannot reach FLARE-X API. Check the backend connection and try again.');
  }
  if (!response.ok) {
    let detail;
    try {
      detail = (await response.json()).detail;
    } catch { /* Non-JSON backend errors are handled below. */ }
    const message = typeof detail === 'string' ? detail : Array.isArray(detail)
      ? detail.map((issue) => issue.msg || 'Invalid input').join('; ') : `API request failed (${response.status}).`;
    throw new ApiError(message, response.status);
  }
  try { return await response.json(); }
  catch { throw new ApiError('API returned an unreadable response. Please try again.', response.status); }
}

export const apiGet = (path, signal, baseUrl = '') => request(path, { signal, baseUrl });
export const apiPost = (path, body, signal, baseUrl = '') => request(path, { method: 'POST', body, signal, baseUrl });
