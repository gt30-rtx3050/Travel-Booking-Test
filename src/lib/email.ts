import type { Payload } from 'payload'
import { Resend } from 'resend'

export interface BookingNotificationPayload {
  bookingId: string
  tripTitle: string
  tripSlug: string
  preferredDate: string
  name: string
  email: string
  phone: string
  numberOfTravelers: number
  message?: string
}

export interface ContactNotificationPayload {
  submissionId: string
  name: string
  email: string
  phone?: string
  subject: string
  inquiryType: string
  destinationInterest?: string
  message: string
}

export async function sendBookingNotifications(
  payload: Payload,
  data: BookingNotificationPayload,
): Promise<void> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'bookings@celeste-expeditions.com'
  const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'concierge@celeste-expeditions.com'
  const fromName = process.env.EMAIL_FROM_NAME || 'Celeste Expeditions Concierge'

  const guestHtml = `
    <div style="font-family: Arial, sans-serif; color: #03045e; background-color: #ffffff; padding: 32px; border: 1px solid #90e0ef;">
      <p style="font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #0077b6; margin: 0 0 12px;">Celeste Expeditions · Zürich</p>
      <h1 style="font-size: 24px; color: #03045e; margin: 0 0 16px;">Your Expedition Dossier & Inquiry Confirmation</h1>
      <p style="font-size: 15px; line-height: 1.6; color: #03045e;">Dear ${data.name},</p>
      <p style="font-size: 15px; line-height: 1.6; color: #03045e;">
        Thank you for requesting space on <strong>${data.tripTitle}</strong>. Your reservation dossier (#${data.bookingId.slice(-6).toUpperCase()}) has been assigned to a Senior Route Specialist in Zürich.
      </p>
      <div style="background-color: #caf0f8; padding: 20px; margin: 24px 0;">
        <p style="margin: 4px 0;"><strong>Expedition:</strong> ${data.tripTitle}</p>
        <p style="margin: 4px 0;"><strong>Preferred Departure:</strong> ${data.preferredDate}</p>
        <p style="margin: 4px 0;"><strong>Party Size:</strong> ${data.numberOfTravelers} Traveler(s)</p>
        <p style="margin: 4px 0;"><strong>Contact Telephone:</strong> ${data.phone}</p>
      </div>
      <p style="font-size: 14px; line-height: 1.6; color: #03045e;">
        We will contact you within 24 hours with cabin/refuge allocation details and your private pre-departure briefing schedule.
      </p>
    </div>
  `

  const adminHtml = `
    <div style="font-family: Arial, sans-serif; color: #03045e; background-color: #ffffff; padding: 24px; border: 1px solid #90e0ef;">
      <h2 style="color: #03045e; margin-top: 0;">New Expedition Booking Inquiry</h2>
      <p><strong>Reference ID:</strong> ${data.bookingId}</p>
      <p><strong>Trip:</strong> ${data.tripTitle} (${data.tripSlug})</p>
      <p><strong>Preferred Date:</strong> ${data.preferredDate}</p>
      <p><strong>Guest:</strong> ${data.name} (${data.email} · ${data.phone})</p>
      <p><strong>Travelers:</strong> ${data.numberOfTravelers}</p>
      <p><strong>Notes:</strong> ${data.message || 'None provided'}</p>
    </div>
  `

  try {
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await Promise.allSettled([
        resend.emails.send({
          from: `${fromName} <${fromAddress}>`,
          to: [data.email],
          subject: `Expedition Inquiry Received: ${data.tripTitle}`,
          html: guestHtml,
        }),
        resend.emails.send({
          from: `${fromName} <${fromAddress}>`,
          to: [adminEmail],
          subject: `[New Booking] ${data.tripTitle} — ${data.name}`,
          html: adminHtml,
        }),
      ])
      return
    }

    await Promise.allSettled([
      payload.sendEmail({
        to: data.email,
        subject: `Expedition Inquiry Received: ${data.tripTitle}`,
        html: guestHtml,
      }),
      payload.sendEmail({
        to: adminEmail,
        subject: `[New Booking] ${data.tripTitle} — ${data.name}`,
        html: adminHtml,
      }),
    ])
  } catch (err) {
    console.warn('[Email] Non-fatal notification warning:', err)
  }
}

export async function sendContactNotifications(
  payload: Payload,
  data: ContactNotificationPayload,
): Promise<void> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'concierge@celeste-expeditions.com'
  const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'concierge@celeste-expeditions.com'
  const fromName = process.env.EMAIL_FROM_NAME || 'Celeste Expeditions Concierge'

  const guestHtml = `
    <div style="font-family: Arial, sans-serif; color: #03045e; background-color: #ffffff; padding: 32px; border: 1px solid #90e0ef;">
      <p style="font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #0077b6; margin: 0 0 12px;">Celeste Expeditions · Concierge Desk</p>
      <h1 style="font-size: 22px; color: #03045e; margin: 0 0 16px;">We Have Received Your Message</h1>
      <p style="font-size: 15px; line-height: 1.6; color: #03045e;">Dear ${data.name},</p>
      <p style="font-size: 15px; line-height: 1.6; color: #03045e;">
        Thank you for reaching out to Celeste Expeditions regarding <strong>${data.subject}</strong>. A specialist from our Zürich headquarters will respond personally within one business day.
      </p>
    </div>
  `

  const adminHtml = `
    <div style="font-family: Arial, sans-serif; color: #03045e; background-color: #ffffff; padding: 24px; border: 1px solid #90e0ef;">
      <h2 style="color: #03045e; margin-top: 0;">New Concierge Submission (${data.inquiryType})</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
      <p><strong>Destination Interest:</strong> ${data.destinationInterest || 'General'}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Message:</strong> ${data.message}</p>
    </div>
  `

  try {
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await Promise.allSettled([
        resend.emails.send({
          from: `${fromName} <${fromAddress}>`,
          to: [data.email],
          subject: `Celeste Expeditions Concierge: ${data.subject}`,
          html: guestHtml,
        }),
        resend.emails.send({
          from: `${fromName} <${fromAddress}>`,
          to: [adminEmail],
          subject: `[Concierge Inquiry] ${data.subject} — ${data.name}`,
          html: adminHtml,
        }),
      ])
      return
    }

    await Promise.allSettled([
      payload.sendEmail({
        to: data.email,
        subject: `Celeste Expeditions Concierge: ${data.subject}`,
        html: guestHtml,
      }),
      payload.sendEmail({
        to: adminEmail,
        subject: `[Concierge Inquiry] ${data.subject} — ${data.name}`,
        html: adminHtml,
      }),
    ])
  } catch (err) {
    console.warn('[Email] Non-fatal notification warning:', err)
  }
}
