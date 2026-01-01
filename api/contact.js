// Vercel Serverless Function (e.g., api/contact.js)
// Install 'resend' in your serverless environment: npm install resend

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Enable CORS - Production Polish
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://chinawindow4u.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, phone, subject, message, recipients, attachments } = req.body;

    // Production Polish: Ensure both inboxes always get it
    const defaultRecipients = ["info@chinawindow4u.com", "admissionvisawindow@gmail.com"];
    const emailRecipients = recipients && recipients.length > 0 ? recipients : defaultRecipients;

    // Logging for debugging via Vercel logs
    console.log('Email sending attempt:', { to: emailRecipients, subject, name, email });

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #b8860b 0%, #daa520 100%); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; text-align: center;">China Window Group</h1>
          <p style="color: #fff9e6; margin: 5px 0 0; text-align: center;">New Form Submission</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 25px; border: 1px solid #e0e0e0;">
          <h2 style="color: #333; border-bottom: 2px solid #daa520; padding-bottom: 10px;">${subject || 'New Inquiry'}</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            ${name ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Name:</td><td style="padding: 10px 0; border-bottom: 1px solid #eee;">${name}</td></tr>` : ''}
            ${email ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td><td style="padding: 10px 0; border-bottom: 1px solid #eee;"><a href="mailto:${email}" style="color: #b8860b;">${email}</a></td></tr>` : ''}
            ${phone ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td><td style="padding: 10px 0; border-bottom: 1px solid #eee;"><a href="tel:${phone}" style="color: #b8860b;">${phone}</a></td></tr>` : ''}
          </table>
          
          <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #daa520;">
            <h3 style="color: #333; margin: 0 0 10px;">Message Details:</h3>
            <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; color: #555; margin: 0; line-height: 1.6;">${message}</pre>
          </div>
        </div>
        
        <div style="background: #333; color: #999; padding: 15px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px;">
          <p style="margin: 0;">Sent from China Window Group Website</p>
          <p style="margin: 5px 0 0;">© 2008 China Window Group</p>
        </div>
      </div>
    `;

    // Validate attachments format for Resend
    const validatedAttachments = (attachments || []).map(att => ({
      filename: att.filename,
      content: att.content,
    }));

    const { data, error } = await resend.emails.send({
      from: "China Window Group <noreply@chinawindow4u.com>",
      to: emailRecipients,
      subject: subject || "New Inquiry - China Window Group",
      html: emailContent,
      replyTo: email || undefined,
      attachments: validatedAttachments,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    console.log('Email sent successfully:', { id: data.id, to: emailRecipients });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Gateway error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
