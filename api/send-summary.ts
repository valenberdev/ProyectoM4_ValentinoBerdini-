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
  const colorPrioridad: Record<string, string> = {
    high: '#FB7185',
    medium: '#FBBF24',
    low: '#64748B',
  };

  const pendingHtml = pendingTasks.length
    ? pendingTasks
        .map(
          (t) => `
        <tr>
          <td style="padding: 12px 16px; border-left: 3px solid ${colorPrioridad[t.priority] || '#64748B'}; background: #1B1F2B; border-radius: 8px;">
            <span style="color: #E8EAF0; font-family: Arial, sans-serif; font-size: 14px;">${t.title}</span>
            <span style="color: ${colorPrioridad[t.priority] || '#64748B'}; font-size: 12px; margin-left: 8px; text-transform: uppercase;">● ${t.priority}</span>
          </td>
        </tr>
        <tr><td style="height: 8px;"></td></tr>`
        )
        .join('')
    : `<tr><td style="padding: 16px; color: #8B92A8; font-family: Arial, sans-serif; font-size: 14px;">No tenés tareas pendientes 🎉</td></tr>`;

  const completedHtml = completedTasks.length
    ? completedTasks
        .map(
          (t) => `
        <tr>
          <td style="padding: 12px 16px; background: #1B1F2B; border-radius: 8px; text-decoration: line-through; color: #8B92A8; font-family: Arial, sans-serif; font-size: 14px;">
            ${t.title}
          </td>
        </tr>
        <tr><td style="height: 8px;"></td></tr>`
        )
        .join('')
    : `<tr><td style="padding: 16px; color: #8B92A8; font-family: Arial, sans-serif; font-size: 14px;">Todavía no completaste tareas</td></tr>`;

  return `
  <div style="background: #12141C; padding: 32px 16px; font-family: Arial, sans-serif;">
    <table role="presentation" width="100%" style="max-width: 480px; margin: 0 auto; border-collapse: collapse;">
      <tr>
        <td style="padding-bottom: 24px;">
          <span style="color: #5EEAD4; font-size: 20px; font-weight: bold;">◆ Gestor de Tareas</span>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 8px;">
          <span style="color: #E8EAF0; font-size: 16px; font-weight: bold;">Pendientes</span>
        </td>
      </tr>
      ${pendingHtml}
      <tr><td style="height: 16px;"></td></tr>
      <tr>
        <td style="padding-bottom: 8px;">
          <span style="color: #E8EAF0; font-size: 16px; font-weight: bold;">Completadas</span>
        </td>
      </tr>
      ${completedHtml}
      <tr>
        <td style="padding-top: 24px; color: #8B92A8; font-size: 12px;">
          Este es un resumen automático de tu Gestor de Tareas.
        </td>
      </tr>
    </table>
  </div>
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