import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

interface ResumenEmailBody {
  toEmail: string;
  pendingTasks: { title: string; priority: string }[];
  completedTasks: { title: string }[];
}

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

function construirHtmlResumen(
  pendingTasks: { title: string; priority: string }[],
  completedTasks: { title: string }[]
): string {
  const pendingHtml = pendingTasks
    .map((t) => `<li>${t.title} (prioridad: ${t.priority})</li>`)
    .join('');

  const completedHtml = completedTasks
    .map((t) => `<li>${t.title}</li>`)
    .join('');

  return `
    <h2>Resumen de tus tareas</h2>
    <h3>Pendientes</h3>
    <ul>${pendingHtml || '<li>No tenés tareas pendientes</li>'}</ul>
    <h3>Completadas</h3>
    <ul>${completedHtml || '<li>No tenés tareas completadas</li>'}</ul>
  `;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

    const { toEmail, pendingTasks, completedTasks } = req.body as ResumenEmailBody;

  if (!toEmail) {
    return res.status(400).json({ error: 'Falta el email destinatario' });
  }

  try {
  const htmlBody = construirHtmlResumen(pendingTasks, completedTasks);

  const command = new SendEmailCommand({
    Source: process.env.SES_SENDER_EMAIL,
    Destination: { ToAddresses: [toEmail] },
    Message: {
      Subject: { Data: 'Resumen de tus tareas' },
      Body: { Html: { Data: htmlBody } },
    },
  });

  await sesClient.send(command);
  return res.status(200).json({ success: true });
} catch (error) {
  console.error('Error al enviar email:', error);
  return res.status(500).json({ error: 'No se pudo enviar el email' });
}
}