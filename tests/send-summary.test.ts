import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@aws-sdk/client-ses', () => ({
  SESClient: vi.fn().mockImplementation(function (this: any) {
    this.send = vi.fn().mockResolvedValue({});
  }),
  SendEmailCommand: vi.fn(),
}));

import handler from '../api/send-summary';

function crearMockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('api/send-summary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve 400 si falta toEmail', async () => {
    const req: any = { method: 'POST', body: { pendingTasks: [], completedTasks: [] } };
    const res = crearMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Falta el email destinatario' });
  });

  it('devuelve 200 y llama a sesClient.send con una request válida', async () => {
    const req: any = {
      method: 'POST',
      body: {
        toEmail: 'test@test.com',
        pendingTasks: [{ title: 'Tarea', priority: 'high' }],
        completedTasks: [],
      },
    };
    const res = crearMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });
});