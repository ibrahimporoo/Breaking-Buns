import { env } from "@/lib/env";

export type Mail = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
};

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function sendMail(mail: Mail): Promise<boolean> {
  if (!env.RESEND_API_KEY) {
    console.info(
      `[mail:console] to=${[mail.to].flat().join(",")} subject="${mail.subject}"\n${mail.text}`,
    );
    return true;
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: mail.to,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      }),
    });

    if (!response.ok) {
      console.error(`[mail] Resend rejected the message: ${response.status}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[mail] Failed to send", error);
    return false;
  }
}
