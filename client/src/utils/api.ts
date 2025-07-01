export async function get(url: string): Promise<any> {
  const response = await fetch(url);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'API Error');
  }

  return data.data;
}

export async function post(url: string, body: any): Promise<any> {
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

export async function put(url: string, body: any): Promise<any> {
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