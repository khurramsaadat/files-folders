// Email service integration for Files & Folders contact form
// This file provides multiple options for sending emails

interface EmailData {
  to: string;
  from: string;
  subject: string;
  html: string;
  name: string;
  message: string;
}

/**
 * Option 1: EmailJS Integration (Recommended for client-side)
 * 
 * To use EmailJS:
 * 1. Sign up at https://www.emailjs.com/
 * 2. Create a service (Gmail, Outlook, etc.)
 * 3. Create an email template
 * 4. Get your Service ID, Template ID, and Public Key
 * 5. Install EmailJS: npm install @emailjs/browser
 * 6. Uncomment and configure the function below
 */

// import emailjs from '@emailjs/browser';

// export async function sendEmailViaEmailJS(data: EmailData): Promise<boolean> {
//   try {
//     const templateParams = {
//       from_name: data.name,
//       from_email: data.from,
//       subject: data.subject,
//       message: data.message,
//       to_email: 'khurram.saadat@yahoo.com'
//     };

//     const result = await emailjs.send(
//       'YOUR_SERVICE_ID',        // Replace with your EmailJS service ID
//       'YOUR_TEMPLATE_ID',       // Replace with your EmailJS template ID
//       templateParams,
//       'YOUR_PUBLIC_KEY'         // Replace with your EmailJS public key
//     );

//     return result.status === 200;
//   } catch (error) {
//     console.error('EmailJS error:', error);
//     return false;
//   }
// }

/**
 * Option 2: Nodemailer with SMTP (Server-side)
 * 
 * To use Nodemailer:
 * 1. Install: npm install nodemailer @types/nodemailer
 * 2. Set up environment variables for email credentials
 * 3. Uncomment and configure the function below
 */

// import nodemailer from 'nodemailer';

// export async function sendEmailViaNodemailer(data: EmailData): Promise<boolean> {
//   try {
//     // Create transporter
//     const transporter = nodemailer.createTransporter({
//       host: process.env.SMTP_HOST,
//       port: parseInt(process.env.SMTP_PORT || '587'),
//       secure: false, // true for 465, false for other ports
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//     });

//     // Send email
//     const result = await transporter.sendMail({
//       from: `"Files & Folders" <${process.env.SMTP_USER}>`,
//       to: 'khurram.saadat@yahoo.com',
//       subject: data.subject,
//       html: data.html,
//       replyTo: data.from,
//     });

//     return !!result.messageId;
//   } catch (error) {
//     console.error('Nodemailer error:', error);
//     return false;
//   }
// }

/**
 * Option 3: SendGrid Integration (Server-side)
 * 
 * To use SendGrid:
 * 1. Sign up at https://sendgrid.com/
 * 2. Get your API key
 * 3. Install: npm install @sendgrid/mail
 * 4. Set SENDGRID_API_KEY in environment variables
 * 5. Uncomment and configure the function below
 */

// import sgMail from '@sendgrid/mail';

// export async function sendEmailViaSendGrid(data: EmailData): Promise<boolean> {
//   try {
//     sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

//     const msg = {
//       to: 'khurram.saadat@yahoo.com',
//       from: 'noreply@yourdomain.com', // Replace with your verified sender
//       subject: data.subject,
//       html: data.html,
//       replyTo: data.from,
//     };

//     await sgMail.send(msg);
//     return true;
//   } catch (error) {
//     console.error('SendGrid error:', error);
//     return false;
//   }
// }

/**
 * Temporary simulation function for development
 * This logs the email data and always returns success
 */
export async function sendEmailSimulation(data: EmailData): Promise<boolean> {
  console.log('=== EMAIL SIMULATION ===');
  console.log('To:', data.to);
  console.log('From:', data.from);
  console.log('Subject:', data.subject);
  console.log('Name:', data.name);
  console.log('Message:', data.message);
  console.log('HTML Content:', data.html);
  console.log('========================');
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return true; // Always return success for simulation
}

/**
 * Main email sending function
 * Switch between different email services here
 */
export async function sendEmail(data: EmailData): Promise<boolean> {
  // For development, use simulation
  // In production, replace with your chosen email service
  return await sendEmailSimulation(data);
  
  // Production examples:
  // return await sendEmailViaEmailJS(data);
  // return await sendEmailViaNodemailer(data);
  // return await sendEmailViaSendGrid(data);
}

/**
 * Generate HTML email template
 */
export function generateEmailHTML(name: string, email: string, subject: string, message: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #7c2d12 0%, #991b1b 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">📁 Files & Folders - Contact Form</h1>
      </div>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
        <h2 style="color: #7c2d12; margin-top: 0;">New Contact Form Submission</h2>
        
        <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #7c2d12;">
          <h3 style="color: #7c2d12; margin: 0 0 10px 0;">Contact Details</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
        </div>
        
        <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #7c2d12;">
          <h3 style="color: #7c2d12; margin: 0 0 10px 0;">Message</h3>
          <p style="line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>
        
        <div style="margin-top: 20px; padding: 10px; background: #fef7f0; border-radius: 6px; font-size: 12px; color: #7c2d12;">
          <p style="margin: 0;"><strong>Note:</strong> This message was sent via the Files & Folders contact form.</p>
          <p style="margin: 5px 0 0 0;">Please reply directly to: ${email}</p>
        </div>
      </div>
    </div>
  `;
}
