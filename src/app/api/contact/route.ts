import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, generateEmailHTML } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Prepare email data
    const emailData = {
      to: 'khurram.saadat@yahoo.com',
      from: email,
      subject: `Contact Form: ${subject}`,
      html: generateEmailHTML(name, email, subject, message),
      name,
      message
    };

    // Send email
    const emailSent = await sendEmail(emailData);

    if (emailSent) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Message sent successfully! We will get back to you within 24-48 hours.' 
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send email. Please try again later.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
