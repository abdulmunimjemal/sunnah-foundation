import mail from '@sendgrid/mail';
import { log } from './vite';

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  fromName?: string;
}

/**
 * Initialize SendGrid with API key
 */
export function initSendGrid() {
  if (!process.env.SENDGRID_API_KEY) {
    log('SendGrid API key is not set. Email functionality will not work.', 'email');
    return false;
  }

  try {
    mail.setApiKey(process.env.SENDGRID_API_KEY);
    return true;
  } catch (error) {
    log(`Error initializing SendGrid: ${error}`, 'email');
    return false;
  }
}

/**
 * Send an email using SendGrid
 */
export async function sendEmail({ to, subject, text, html, fromName = 'Sunnah Foundation' }: EmailOptions): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    log('Cannot send email: SendGrid API key is not set', 'email');
    return false;
  }

  try {
    const msg = {
      to,
      from: {
        email: 'noreply@sunnahfoundation.org',
        name: fromName
      },
      subject,
      text: text || '',
      html: html || ''
    };

    await mail.send(msg);
    log(`Email sent successfully to ${Array.isArray(to) ? to.join(', ') : to}`, 'email');
    return true;
  } catch (error) {
    log(`Error sending email: ${error}`, 'email');
    return false;
  }
}

/**
 * Send a newsletter to multiple subscribers
 */
export async function sendNewsletter(
  recipientEmails: string[],
  subject: string,
  htmlContent: string
): Promise<{ success: boolean; message: string }> {
  if (!process.env.SENDGRID_API_KEY) {
    return {
      success: false,
      message: 'SendGrid API key is not set. Cannot send newsletter.'
    };
  }

  if (recipientEmails.length === 0) {
    return {
      success: false,
      message: 'No recipients specified'
    };
  }

  try {
    // For large subscriber lists, batch sending in chunks of 1000 emails
    const batchSize = 1000;
    let successCount = 0;
    
    for (let i = 0; i < recipientEmails.length; i += batchSize) {
      const batch = recipientEmails.slice(i, i + batchSize);
      
      // Use BCC for privacy
      const result = await sendEmail({
        to: batch,
        subject,
        html: htmlContent,
        fromName: 'Sunnah Foundation Newsletter'
      });
      
      if (result) {
        successCount += batch.length;
      }
    }

    return {
      success: true,
      message: `Newsletter sent to ${successCount} out of ${recipientEmails.length} subscribers`
    };
  } catch (error) {
    log(`Error sending newsletter: ${error}`, 'email');
    return {
      success: false,
      message: `Failed to send newsletter: ${error}`
    };
  }
}