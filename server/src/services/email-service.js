import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initPromise = null;
    this.providerType = 'unconfigured';
  }

  async getTransporter() {
    if (this.transporter) {
      return this.transporter;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      // 1. Check if standard SMTP is configured in .env
      if (config.email.host && config.email.user) {
        try {
          const transporter = nodemailer.createTransport({
            host: config.email.host,
            port: config.email.port,
            secure: config.email.secure,
            auth: {
              user: config.email.user,
              pass: config.email.pass,
            },
            tls: {
              rejectUnauthorized: false
            }
          });

          await transporter.verify();
          console.log(`📧 [EmailService] Connected to SMTP host: ${config.email.host}`);
          this.transporter = transporter;
          this.providerType = 'smtp';
          return transporter;
        } catch (smtpErr) {
          console.warn(`⚠️ [EmailService] SMTP verification failed (${smtpErr.message}). Falling back to test account.`);
        }
      }

      // 2. Fallback to Ethereal Email for automated testing & development
      try {
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        console.log(`📧 [EmailService] Initialized Ethereal test mailer (${testAccount.user})`);
        this.transporter = transporter;
        this.providerType = 'ethereal';
        return transporter;
      } catch (etherealErr) {
        console.warn(`⚠️ [EmailService] Ethereal initialization failed (${etherealErr.message}). Using simulated local transport.`);
        
        // 3. Fallback to local simulated transport if offline
        const transporter = nodemailer.createTransport({
          jsonTransport: true
        });
        this.transporter = transporter;
        this.providerType = 'simulated';
        return transporter;
      }
    })();

    return this.initPromise;
  }

  /**
   * Send a medication reminder email
   */
  async sendMedicationReminder({
    to,
    userName = 'Patient',
    medicineName,
    dosage,
    scheduledTime,
    mealRelation,
    instructions,
    notes,
  }) {
    if (!to) {
      throw new Error('Recipient email is required to send medication reminder');
    }

    const transporter = await this.getTransporter();
    const fromAddress = config.email.from || '"MedBuddy Reminders" <reminders@medbuddy.health>';
    const clientUrl = config.clientUrl || 'http://localhost:3000';

    // Format meal instruction text
    const mealText = mealRelation ? mealRelation.replace(/_/g, ' ') : null;
    const instructionLines = [
      mealText ? `Timing: Take ${mealText}` : null,
      instructions ? `Instructions: ${instructions}` : null,
      notes ? `Clinical Note: ${notes}` : null,
    ].filter(Boolean).join('\n');

    const plainInstructions = instructionLines || 'Take as prescribed by your doctor.';

    // Plain text version matching prompt specifications
    const textContent = `Subject: 💊 Medication Reminder — MedBuddy

Hello ${userName},

This is your MedBuddy medication reminder.

Medication:
${medicineName}

Dose:
${dosage}

Scheduled time:
${scheduledTime}

Instructions:
${plainInstructions}

Please follow the medication instructions provided by your healthcare professional.

Open MedBuddy to view your medication schedule:
${clientUrl}/medications

— MedBuddy`;

    // Clean, accessible HTML email
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Medication Reminder — MedBuddy</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #0284c7; padding: 24px 32px; color: #ffffff; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
    .body { padding: 32px; }
    .greeting { font-size: 16px; font-weight: 600; margin-top: 0; margin-bottom: 8px; color: #0f172a; }
    .intro { font-size: 14px; color: #475569; margin-bottom: 24px; line-height: 1.5; }
    .med-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .med-name { font-size: 18px; font-weight: 700; color: #0369a1; margin-bottom: 12px; }
    .detail-row { display: flex; margin-bottom: 8px; font-size: 14px; }
    .detail-label { width: 140px; font-weight: 600; color: #475569; }
    .detail-value { font-weight: 700; color: #0f172a; }
    .disclaimer-box { background: #f8fafc; border-left: 4px solid #94a3b8; padding: 12px 16px; font-size: 12px; color: #64748b; margin-bottom: 24px; line-height: 1.5; }
    .button { display: inline-block; background: #0284c7; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; text-align: center; }
    .footer { text-align: center; padding: 20px 32px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>💊 Medication Reminder — MedBuddy</h1>
    </div>
    <div class="body">
      <p class="greeting">Hello ${userName},</p>
      <p class="intro">This is your automated MedBuddy medication reminder for your scheduled dose.</p>
      
      <div class="med-box">
        <div class="med-name">${medicineName}</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #475569; width: 130px; font-weight: 600;">Dose:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${dosage}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #475569; font-weight: 600;">Scheduled time:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #0284c7;">${scheduledTime}</td>
          </tr>
          ${mealText ? `
          <tr>
            <td style="padding: 6px 0; color: #475569; font-weight: 600;">Meal relation:</td>
            <td style="padding: 6px 0; font-weight: 500; color: #334155; text-transform: capitalize;">${mealText}</td>
          </tr>` : ''}
          ${instructions ? `
          <tr>
            <td style="padding: 6px 0; color: #475569; font-weight: 600;">Instructions:</td>
            <td style="padding: 6px 0; font-weight: 500; color: #334155;">${instructions}</td>
          </tr>` : ''}
        </table>
      </div>

      <div class="disclaimer-box">
        <strong>Important Safety Reminder:</strong> Please follow the medication instructions provided by your healthcare professional. Do not modify your dose or schedule independently.
      </div>

      <div style="text-align: center; margin-bottom: 16px;">
        <a href="${clientUrl}/medications" class="button">Open MedBuddy Schedule</a>
      </div>
    </div>
    <div class="footer">
      This is an automated notification sent from MedBuddy to your registered email.<br>
      © ${new Date().getFullYear()} MedBuddy Healthcare Technologies. All rights reserved.
    </div>
  </div>
</body>
</html>`;

    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject: `💊 Medication Reminder: ${medicineName} (${scheduledTime}) — MedBuddy`,
        text: textContent,
        html: htmlContent,
      });

      let previewUrl = null;
      if (this.providerType === 'ethereal') {
        previewUrl = nodemailer.getTestMessageUrl(info);
      }

      console.log(`✅ [EmailService] Reminder sent to ${to} for ${medicineName} at ${scheduledTime}. MessageId: ${info.messageId || 'simulated'}${previewUrl ? ` | Preview: ${previewUrl}` : ''}`);

      return {
        success: true,
        messageId: info.messageId || `sim-${Date.now()}`,
        previewUrl,
        provider: this.providerType,
        recipient: to,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      console.error(`❌ [EmailService] Failed to send reminder email to ${to}:`, err.message);
      return {
        success: false,
        error: err.message,
        recipient: to,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export const emailService = new EmailService();
export default emailService;
