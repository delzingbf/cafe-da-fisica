import type { MailMessage } from '../../infrastructure/mail/mail.service.js';

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function orderNotificationEmailConfirmation(
    email: string,
): Pick<MailMessage, 'subject' | 'html' | 'text'> {
    const safeEmail = escapeHtml(email);
    return {
        subject: 'E-mail de recebimento de pedidos atualizado',
        text:
            `Este endereço foi configurado para receber os avisos de novos pedidos do Café da Física.\n\n` +
            `E-mail configurado: ${email}\n\n` +
            'Se você não esperava esta mensagem, entre em contato com o administrador do Café da Física.',
        html: `<!doctype html>
<html lang="pt-BR">
<body style="margin:0;padding:24px 16px;font-family:Arial,Helvetica,sans-serif;color:#333333;">
  <main style="max-width:560px;padding:24px;border:2px solid #f9df76;border-radius:8px;">
    <h1 style="margin:0 0 16px;color:#6b4226;font-size:22px;">Café da Física</h1>
    <p>Este endereço foi configurado para receber os avisos de novos pedidos.</p>
    <p><strong>E-mail configurado:</strong> ${safeEmail}</p>
    <p style="color:#777777;">Se você não esperava esta mensagem, entre em contato com o administrador do Café da Física.</p>
  </main>
</body>
</html>`,
    };
}
