export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<Response> {
  const token = localStorage.getItem('jwt_token');
  const base = (import.meta.env && import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : 'http://localhost:8080';
  const fullUrl = url.startsWith('http') ? url : `${base}${url}`;
  
  const headers: Record<string, string> = {};
  
  if (data) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    let errorBody: any = null;
    try {
      if (contentType.includes('application/json')) {
        errorBody = await response.json();
      } else {
        errorBody = await response.text();
      }
    } catch (e) {
      // ignore parse errors
    }

    const err = new Error(errorBody && errorBody.message ? errorBody.message : `${response.status}: ${response.statusText}`);
    // attach structured details when available
    (err as any).details = errorBody;
    throw err;
  }

  return response;
}
