import 'dotenv/config'
import { getPayloadClient } from '../src/lib/payload.js'
import {
  submitBookingAction,
  submitContactAction,
  submitNewsletterAction,
} from '../src/app/actions.js'

interface TestResult {
  name: string
  passed: boolean
  details?: string
  error?: unknown
}

const results: TestResult[] = []

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`)
  }
}

async function runTest(name: string, fn: () => Promise<void>) {
  try {
    await fn()
    results.push({ name, passed: true })
    console.log(`  ✓ ${name}`)
  } catch (err: any) {
    results.push({ name, passed: false, error: err, details: err?.message })
    console.error(`  ✗ ${name}: ${err?.message}`)
  }
}

async function main() {
  console.log('====================================================')
  console.log('CELESTE EXPEDITIONS: END-TO-END FORM & PIPELINE TESTS')
  console.log('====================================================\n')

  const payload = await getPayloadClient()

  // 1. HTTP Route & Form DOM Markup Tests
  console.log('--- 1. HTTP Endpoint & DOM Form Verification ---')

  await runTest('Homepage (/) returns 200 and renders newsletter form', async () => {
    const res = await fetch('http://localhost:3000/')
    assert(res.status === 200, `Expected 200, got ${res.status}`)
    const html = await res.text()
    assert(html.includes('Celeste Expeditions'), 'Missing brand name')
    assert(html.includes('newsletter-email') || html.includes('Enter your email address'), 'Missing newsletter input')
    assert(html.includes('Subscribe to Dispatches'), 'Missing newsletter submit button')
  })

  await runTest('Trips Listing (/trips) returns 200 and renders trip cards', async () => {
    const res = await fetch('http://localhost:3000/trips')
    assert(res.status === 200, `Expected 200, got ${res.status}`)
    const html = await res.text()
    assert(html.includes('Brenta Dolomites'), 'Missing Brenta Dolomites card')
    assert(html.includes('Svalbard Arctic'), 'Missing Svalbard card')
    assert(html.includes('Patagonia Fitz Roy'), 'Missing Patagonia card')
  })

  await runTest('Trip Detail (/trips/brenta-dolomites-high-traverse) renders booking panel & form', async () => {
    const res = await fetch('http://localhost:3000/trips/brenta-dolomites-high-traverse')
    assert(res.status === 200, `Expected 200, got ${res.status}`)
    const html = await res.text()
    assert(html.includes('booking-calendar'), 'Missing booking calendar section')
    assert(html.includes('booking-inquiry-panel') || html.includes('Departure 1'), 'Missing departure selector')
    assert(html.includes('booking-name') || html.includes('Full Name'), 'Missing guest name field')
    assert(html.includes('booking-email') || html.includes('Email Address'), 'Missing guest email field')
    assert(html.includes('booking-phone') || html.includes('Telephone'), 'Missing telephone field')
    assert(html.includes('booking-travelers') || html.includes('Number of Travelers'), 'Missing party size field')
  })

  await runTest('Contact Page (/contact) renders concierge consultation form', async () => {
    const res = await fetch('http://localhost:3000/contact')
    assert(res.status === 200, `Expected 200, got ${res.status}`)
    const html = await res.text()
    assert(html.includes('contact-name'), 'Missing contact name field')
    assert(html.includes('contact-email'), 'Missing contact email field')
    assert(html.includes('contact-phone'), 'Missing contact phone field')
    assert(html.includes('contact-subject'), 'Missing contact subject field')
    assert(html.includes('contact-message'), 'Missing contact message field')
    assert(html.includes('contact-inquiryType'), 'Missing contact inquiryType selector')
  })

  await runTest('Thank You Page (/thank-you) renders booking confirmation view', async () => {
    const res = await fetch('http://localhost:3000/thank-you?type=booking&ref=BD7891&name=Alexander+Wright&trip=Brenta+Dolomites+High+Traverse&date=2026-07-12')
    assert(res.status === 200, `Expected 200, got ${res.status}`)
    const html = await res.text()
    assert(html.includes('BD7891'), 'Missing reference code')
    assert(html.includes('Alexander Wright'), 'Missing guest name')
    assert(html.includes('Brenta Dolomites High Traverse'), 'Missing expedition title')
  })

  await runTest('Thank You Page (/thank-you) renders contact inquiry confirmation view', async () => {
    const res = await fetch('http://localhost:3000/thank-you?type=contact&ref=CT4421&name=Charlotte+Dubois&subject=Private+Charter+Charter+Valais')
    assert(res.status === 200, `Expected 200, got ${res.status}`)
    const html = await res.text()
    assert(html.includes('CT4421'), 'Missing reference code')
    assert(html.includes('Charlotte Dubois'), 'Missing guest name')
    assert(html.includes('Private Charter Charter Valais'), 'Missing subject')
  })

  // 2. Booking Form Server Action & Database Persistence Tests
  console.log('\n--- 2. Booking Form End-to-End Persistence Tests ---')

  const tripRes = await payload.find({
    collection: 'trips',
    where: { slug: { equals: 'brenta-dolomites-high-traverse' } },
    limit: 1,
  })
  assert(tripRes.docs.length > 0, 'Seed trip brenta-dolomites-high-traverse must exist')
  const seededTrip = tripRes.docs[0]

  let createdBookingId = ''

  await runTest('submitBookingAction successfully creates booking document in Payload DB', async () => {
    const input = {
      tripId: String(seededTrip.id),
      tripTitle: seededTrip.title,
      preferredDate: '2026-07-12',
      name: 'Frederik Von Hapsburg',
      email: 'frederik.hapsburg@alpen-invest.ch',
      phone: '+41 79 400 12 34',
      numberOfTravelers: 2,
      message: 'Interested in private 2-person room allocations at Rifugio Tuckett and dietary gluten-free option.',
    }

    const res = await submitBookingAction(input)
    assert(res.success === true, `Expected success, got: ${JSON.stringify(res)}`)
    assert(Boolean(res.id), 'Expected booking id')
    assert(Boolean(res.redirectUrl), 'Expected redirectUrl')
    assert(res.redirectUrl!.includes('/thank-you'), 'redirectUrl should target /thank-you')
    assert(res.redirectUrl!.includes('type=booking'), 'redirectUrl should specify type=booking')
    createdBookingId = res.id!

    // Verify in database
    const dbBooking = await payload.findByID({
      collection: 'bookings',
      id: createdBookingId,
      depth: 1,
    })
    assert(Boolean(dbBooking), 'Booking not found in database')
    assert(dbBooking.name === input.name, `Name mismatch: ${dbBooking.name}`)
    assert(dbBooking.email === input.email, `Email mismatch: ${dbBooking.email}`)
    assert(dbBooking.phone === input.phone, `Phone mismatch: ${dbBooking.phone}`)
    assert(dbBooking.numberOfTravelers === 2, `Travelers mismatch: ${dbBooking.numberOfTravelers}`)
    assert(dbBooking.preferredDate === '2026-07-12', `Date mismatch: ${dbBooking.preferredDate}`)
    assert(dbBooking.status === 'new', `Status should be new: ${dbBooking.status}`)
    const relatedTripId = typeof dbBooking.trip === 'object' ? dbBooking.trip.id : dbBooking.trip
    assert(String(relatedTripId) === String(seededTrip.id), 'Trip relationship mismatch')
  })

  await runTest('submitBookingAction validates schema and rejects invalid inputs cleanly', async () => {
    const invalidInput: any = {
      tripId: '', // invalid: empty
      preferredDate: '', // invalid: empty
      name: 'A', // invalid: min 2
      email: 'not-an-email', // invalid email
      phone: '12', // invalid: min 6
      numberOfTravelers: 0, // invalid: min 1
    }

    const res = await submitBookingAction(invalidInput)
    assert(res.success === false, 'Expected rejection of invalid input')
    assert(Boolean(res.errors), 'Expected errors object')
    assert(Boolean(res.errors?.tripId), 'Expected tripId error')
    assert(Boolean(res.errors?.preferredDate), 'Expected preferredDate error')
    assert(Boolean(res.errors?.name), 'Expected name error')
    assert(Boolean(res.errors?.email), 'Expected email error')
    assert(Boolean(res.errors?.phone), 'Expected phone error')
    assert(Boolean(res.errors?.numberOfTravelers), 'Expected numberOfTravelers error')
  })

  // 3. Contact Form Server Action & Database Persistence Tests
  console.log('\n--- 3. Contact Form End-to-End Persistence Tests ---')

  let createdContactId = ''

  await runTest('submitContactAction successfully creates contact submission document in Payload DB', async () => {
    const input = {
      name: 'Baroness Vivienne De Montmollin',
      email: 'vivienne.montmollin@chateau-alpine.com',
      phone: '+41 22 819 00 55',
      subject: 'Private Autumn Traverse of the Valais Haute Route',
      destinationInterest: 'Pennine Alps, Switzerland',
      inquiryType: 'bespoke' as const,
      message: 'We are requesting a bespoke private traverse for a family party of six with private refuge buyouts.',
    }

    const res = await submitContactAction(input)
    assert(res.success === true, `Expected success, got: ${JSON.stringify(res)}`)
    assert(Boolean(res.id), 'Expected submission id')
    assert(Boolean(res.redirectUrl), 'Expected redirectUrl')
    assert(res.redirectUrl!.includes('/thank-you'), 'redirectUrl should target /thank-you')
    assert(res.redirectUrl!.includes('type=contact'), 'redirectUrl should specify type=contact')
    createdContactId = res.id!

    // Verify in database
    const dbContact = await payload.findByID({
      collection: 'contact-submissions',
      id: createdContactId,
    })
    assert(Boolean(dbContact), 'Contact submission not found in database')
    assert(dbContact.name === input.name, `Name mismatch: ${dbContact.name}`)
    assert(dbContact.email === input.email, `Email mismatch: ${dbContact.email}`)
    assert(dbContact.phone === input.phone, `Phone mismatch: ${dbContact.phone}`)
    assert(dbContact.subject === input.subject, `Subject mismatch: ${dbContact.subject}`)
    assert(dbContact.destinationInterest === input.destinationInterest, `Destination mismatch`)
    assert(dbContact.inquiryType === 'bespoke', `InquiryType mismatch: ${dbContact.inquiryType}`)
    assert(dbContact.status === 'new', `Status should be new: ${dbContact.status}`)
  })

  await runTest('submitContactAction rejects invalid contact submissions', async () => {
    const invalidInput = {
      name: '',
      email: 'bad-email',
      subject: 'Hi',
      inquiryType: 'general' as const,
      message: 'short', // under 10 chars
    }

    const res = await submitContactAction(invalidInput)
    assert(res.success === false, 'Expected rejection of invalid input')
    assert(Boolean(res.errors?.name), 'Expected name error')
    assert(Boolean(res.errors?.email), 'Expected email error')
    assert(Boolean(res.errors?.subject), 'Expected subject error')
    assert(Boolean(res.errors?.message), 'Expected message error')
  })

  // 4. Newsletter Form Server Action & Database Persistence Tests
  console.log('\n--- 4. Newsletter Form End-to-End Persistence Tests ---')

  await runTest('submitNewsletterAction registers subscriber in contact-submissions with newsletter type', async () => {
    const testEmail = `subscriber-${Date.now()}@alpinist-journal.org`
    const res = await submitNewsletterAction({
      email: testEmail,
      name: 'Alpinist Subscriber',
    })

    assert(res.success === true, `Expected newsletter success, got: ${JSON.stringify(res)}`)
    assert(Boolean(res.id), 'Expected submission id')

    // Verify in database
    const dbSub = await payload.findByID({
      collection: 'contact-submissions',
      id: res.id!,
    })
    assert(Boolean(dbSub), 'Newsletter submission not found in database')
    assert(dbSub.email === testEmail, 'Email mismatch in newsletter submission')
    assert(dbSub.inquiryType === 'newsletter', `Inquiry type should be newsletter, got: ${dbSub.inquiryType}`)
    assert(dbSub.status === 'new', 'Status should be new')
  })

  await runTest('submitNewsletterAction rejects invalid email addresses', async () => {
    const res = await submitNewsletterAction({
      email: 'not-an-email-at-all',
    })
    assert(res.success === false, 'Expected rejection of invalid email')
    assert(Boolean(res.errors?.email), 'Expected email field error')
  })

  // 5. Cleanup Test Records
  console.log('\n--- 5. Test Data Lifecycle Cleanup ---')
  if (createdBookingId) {
    await payload.delete({ collection: 'bookings', id: createdBookingId })
    console.log(`  ✓ Cleaned up test booking record (${createdBookingId})`)
  }
  if (createdContactId) {
    await payload.delete({ collection: 'contact-submissions', id: createdContactId })
    console.log(`  ✓ Cleaned up test contact record (${createdContactId})`)
  }

  // 6. Summary
  console.log('\n====================================================')
  const total = results.length
  const passed = results.filter((r) => r.passed).length
  const failed = total - passed
  console.log(`TEST SUMMARY: ${passed}/${total} PASSED (${failed} FAILED)`)
  console.log('====================================================\n')

  if (failed > 0) {
    process.exit(1)
  }
  process.exit(0)
}

main().catch((err) => {
  console.error('Test runner fatal error:', err)
  process.exit(1)
})
