// src/lib/notification.ts

interface NotificationPayload {
  title: string;
  name: string;
  whatsapp: string;
  service: string;
  timeDetails?: string;
  notes?: string;
}

export async function sendAdminNotification(payload: NotificationPayload) {
  const { title, name, whatsapp, service, timeDetails, notes } = payload;

  const messageText = `
🔔 *${title}*

👤 *Nama:* ${name}
📞 *WhatsApp:* ${whatsapp}
💼 *Layanan:* ${service}
${timeDetails ? `📅 *Waktu:* ${timeDetails}` : ""}
${notes ? `📝 *Catatan:* ${notes}` : ""}
  `.trim();

  // 1. TELEGRAM NOTIFICATION (Instant Push to Phone)
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgChatId = process.env.TELEGRAM_CHAT_ID;

  if (tgToken && tgChatId) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: tgChatId,
          text: messageText,
          parse_mode: "Markdown",
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Telegram Notification Error Response:", errText);
      } else {
        console.log("Telegram Notification sent successfully.");
      }
    } catch (err) {
      console.error("Failed to send Telegram notification:", err);
    }
  }

  // 2. EMAIL NOTIFICATION via Resend
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailTo = process.env.NOTIFICATION_EMAIL_TO;

  if (resendApiKey && emailTo) {
    try {
      const emailHtml = `
        <div style="font-family: sans-serif; padding: 20px; color: #1C2D24; background-color: #F9F6F0;">
          <h2 style="font-family: serif; color: #2D5A27; border-bottom: 1px solid #1C2D24; padding-bottom: 10px;">${title}</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 120px;">Nama:</td>
              <td style="padding: 8px 0;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">WhatsApp:</td>
              <td style="padding: 8px 0;"><a href="https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}">${whatsapp}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Layanan:</td>
              <td style="padding: 8px 0;">${service}</td>
            </tr>
            ${timeDetails ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Jadwal:</td>
              <td style="padding: 8px 0;">${timeDetails}</td>
            </tr>
            ` : ""}
            ${notes ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Catatan/Topik:</td>
              <td style="padding: 8px 0;">${notes}</td>
            </tr>
            ` : ""}
          </table>
          <div style="margin-top: 30px; font-size: 11px; color: #5B7A68; border-top: 1px dashed #1C2D24; padding-top: 10px;">
            Dikirim secara otomatis dari Web Admin Cleaire.
          </div>
        </div>
      `;

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Cleaire <onboarding@resend.dev>",
          to: [emailTo],
          subject: `${title} - ${name}`,
          html: emailHtml,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Resend Email Notification Error Response:", errText);
      } else {
        console.log("Resend Email Notification sent successfully.");
      }
    } catch (err) {
      console.error("Failed to send Resend email notification:", err);
    }
  }
}
