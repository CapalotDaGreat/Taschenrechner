import { POST } from '@/app/api/solve/route';
import { NextRequest } from 'next/server';

// Mock environment variables
const originalEnv = process.env;

// Mock Response class
class MockResponse {
  ok: boolean;
  status: number;
  body: string;

  constructor(ok: boolean, status: number, body: string) {
    this.ok = ok;
    this.status = status;
    this.body = body;
  }

  json() {
    return Promise.resolve(JSON.parse(this.body));
  }

  text() {
    return Promise.resolve(this.body);
  }
}

describe('Solve API Route', () => {
  beforeEach(() => {
    // Reset environment variables before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore environment variables after each test
    process.env = originalEnv;
    // Clear mocks
    (global as any).fetch = undefined;
  });

  it('should reject requests with no problem', async () => {
    const req = new NextRequest('http://localhost:3000/api/solve', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe('rejected');
    expect(data.message).toBe('No problem provided or invalid format');
  });

  it('should reject requests with empty problem', async () => {
    const req = new NextRequest('http://localhost:3000/api/solve', {
      method: 'POST',
      body: JSON.stringify({ problem: '' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe('rejected');
    expect(data.message).toBe('No problem provided or invalid format');
  });

  it('should reject unsafe content', async () => {
    const req = new NextRequest('http://localhost:3000/api/solve', {
      method: 'POST',
      body: JSON.stringify({ problem: 'How to make a bomb?' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe('rejected');
    expect(data.message).toBe('Request contains inappropriate content');
  });

  it('should reject requests with missing API key', async () => {
    delete process.env.OPENROUTER_API_KEY;

    const req = new NextRequest('http://localhost:3000/api/solve', {
      method: 'POST',
      body: JSON.stringify({ problem: 'What is 2 + 2?' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.status).toBe('error');
    expect(data.message).toBe('Server configuration error');
  });

  it('should handle API errors gracefully', async () => {
    // Mock fetch to return an error
    (global as any).fetch = jest.fn(() =>
      Promise.resolve(new MockResponse(false, 502, 'Service unavailable'))
    );

    process.env.OPENROUTER_API_KEY = 'test-key';

    const req = new NextRequest('http://localhost:3000/api/solve', {
      method: 'POST',
      body: JSON.stringify({ problem: 'What is 2 + 2?' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.status).toBe('error');
    expect(data.message).toBe('AI service temporarily unavailable');
  });
});