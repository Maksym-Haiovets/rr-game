export async function get<T = any>(url: string): Promise<T> {
  const response = await fetch(url);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'API Error');
  }

  return data.data;
}

export async function post<T = any>(url: string, body: any): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'API Error');
  }

  return data.data;
}

export async function put<T = any>(url: string, body: any): Promise<T> {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'API Error');
  }

  return data.data;
}