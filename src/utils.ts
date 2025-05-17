export interface GeneralRequest {
  type: string;
  data: any;
  id: number;
}

export function parseRequest(str: string): GeneralRequest {
  const parsed = JSON.parse(str);

  const data = validateRequest<GeneralRequest>(parsed, {
    type: '',
    data: '',
    id: 0,
  });

  if (typeof data.data === 'string' && data.data.trim().length > 0) {
    data.data = JSON.parse(data.data);
  }

  if (data.id !== 0) {
    throw new Error('Invalid ID');
  }

  return data;
}

export function validateRequest<T>(data: any, schema: any): T {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid data');
  }

  for (const key in schema) {
    if (!(key in data)) {
      throw new Error(`Missing key: ${key}`);
    }

    const expectedType = typeof schema[key];
    const actualType = typeof data[key];

    if (actualType !== expectedType) {
      throw new Error(`Invalid type: ${key}`);
    }

    if (expectedType === 'object' && !validateRequest(data[key], schema[key])) {
      throw new Error(`Invalid schema: ${key}`);
    }
  }

  return data;
}
