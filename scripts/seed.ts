import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { getPayloadClient } from '../src/lib/payload.js'

function makeLexical(paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text,
            version: 1,
          },
        ],
        direction: 'ltr' as const,
      })),
    },
  }
}

// Generate an SVG illustration with an architectural alpine aesthetic
function createSvgIllustration(title: string, subtitle: string, variant: 'alpine' | 'polar' | 'patagonia' | 'fjord' | 'portrait') {
  let primaryColor = '#0077b6'
  let secondaryColor = '#03045e'
  let accentColor = '#00b4d8'
  let bgColor = '#caf0f8'

  if (variant === 'polar') {
    primaryColor = '#00b4d8'
    secondaryColor = '#0077b6'
    accentColor = '#90e0ef'
    bgColor = '#f0f9ff'
  } else if (variant === 'patagonia') {
    primaryColor = '#03045e'
    secondaryColor = '#0077b6'
    accentColor = '#00b4d8'
    bgColor = '#e0f2fe'
  } else if (variant === 'fjord') {
    primaryColor = '#0077b6'
    secondaryColor = '#03045e'
    accentColor = '#38bdf8'
    bgColor = '#e6f7fa'
  } else if (variant === 'portrait') {
    return `<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#03045e"/>
      <stop offset="100%" stop-color="#0077b6"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bgGrad)"/>
  <circle cx="300" cy="240" r="110" fill="#90e0ef" opacity="0.9"/>
  <path d="M160 480 C 160 370, 440 370, 440 480 Z" fill="#caf0f8" opacity="0.85"/>
  <circle cx="300" cy="300" r="230" fill="none" stroke="#caf0f8" stroke-width="2" stroke-dasharray="6,6" opacity="0.4"/>
  <text x="300" y="530" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="bold" fill="#ffffff" letter-spacing="2">${title}</text>
  <text x="300" y="560" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#caf0f8" letter-spacing="1.5">${subtitle}</text>
</svg>`
  }

  return `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${secondaryColor}"/>
      <stop offset="60%" stop-color="${primaryColor}"/>
      <stop offset="100%" stop-color="${bgColor}"/>
    </linearGradient>
    <linearGradient id="peakGrad1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#caf0f8"/>
      <stop offset="100%" stop-color="${secondaryColor}"/>
    </linearGradient>
    <linearGradient id="peakGrad2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#90e0ef"/>
      <stop offset="100%" stop-color="${primaryColor}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#skyGrad)"/>
  <!-- Sun / Moon orb -->
  <circle cx="850" cy="200" r="85" fill="#ffffff" opacity="0.25"/>
  <circle cx="850" cy="200" r="60" fill="#ffffff" opacity="0.45"/>
  <!-- Far background ridges -->
  <polygon points="50,550 280,320 480,550" fill="${primaryColor}" opacity="0.35"/>
  <polygon points="320,550 560,260 820,550" fill="${secondaryColor}" opacity="0.45"/>
  <polygon points="700,550 920,280 1150,550" fill="${primaryColor}" opacity="0.4"/>
  <!-- Mid peaks with sharp ridge geometry -->
  <polygon points="120,680 340,360 460,540 620,310 800,680" fill="url(#peakGrad1)"/>
  <polygon points="480,680 720,280 940,680" fill="url(#peakGrad2)"/>
  <!-- Foreground geometric facets -->
  <polygon points="0,800 0,660 300,580 600,740 1200,620 1200,800" fill="${secondaryColor}"/>
  <polygon points="180,800 420,640 760,800" fill="${accentColor}" opacity="0.2"/>
  <polygon points="680,800 920,660 1200,780" fill="${primaryColor}" opacity="0.3"/>
  <!-- Elegant architectural grid lines -->
  <line x1="100" y1="740" x2="1100" y2="740" stroke="#90e0ef" stroke-width="1" opacity="0.4"/>
  <line x1="100" y1="760" x2="1100" y2="760" stroke="#90e0ef" stroke-width="1" stroke-dasharray="4,8" opacity="0.3"/>
  <!-- Text branding overlay -->
  <rect x="60" y="60" width="540" height="130" rx="8" fill="#03045e" opacity="0.75"/>
  <text x="90" y="105" font-family="sans-serif" font-size="28" font-weight="bold" fill="#ffffff" letter-spacing="2">${title.toUpperCase()}</text>
  <text x="90" y="145" font-family="sans-serif" font-size="14" font-weight="500" fill="#90e0ef" letter-spacing="3">${subtitle.toUpperCase()}</text>
</svg>`
}

async function main() {
  console.log('--- Commencing Celeste Expeditions Database Seeding ---')
  const payload = await getPayloadClient()
  const mediaDir = path.resolve(process.cwd(), 'public/media')
  fs.mkdirSync(mediaDir, { recursive: true })

  // Helper to ensure media asset exists in public/media and in Payload collection
  async function ensureMedia(filename: string, alt: string, caption: string, svgContent: string) {
    const existing = await payload.find({
      collection: 'media',
      where: {
        filename: {
          equals: filename,
        },
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      return existing.docs[0].id
    }

    const tmpDir = path.resolve(process.cwd(), '.tmp-media')
    fs.mkdirSync(tmpDir, { recursive: true })
    const tmpFile = path.join(tmpDir, filename)
    fs.writeFileSync(tmpFile, svgContent, 'utf8')

    const doc = await payload.create({
      collection: 'media',
      data: { alt, caption },
      filePath: tmpFile,
    })

    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile)
    return doc.id
  }

  // 1. Create Media Assets
  console.log('Generating and registering media assets...')
  const mDolomites = await ensureMedia(
    'hero-dolomites.svg',
    'Brenta Dolomites High Alpine Spires and Ridges',
    'Sheer limestone towers along the Via delle Bocchette Alte.',
    createSvgIllustration('Brenta Dolomites', 'Via delle Bocchette High Traverse', 'alpine'),
  )

  const mSvalbard = await ensureMedia(
    'hero-svalbard.svg',
    'Svalbard Arctic Fjord & Glacial Kayak Expedition',
    'Navigating sea ice and calved blue glaciers in Spitsbergen.',
    createSvgIllustration('Svalbard Arctic Fjord', 'Spitsbergen Glacial Sea Kayak', 'polar'),
  )

  const mPatagonia = await ensureMedia(
    'hero-patagonia.svg',
    'Patagonia Fitz Roy and Southern Ice Cap Traverse',
    'Granite spires of Monte Fitz Roy rising above the glacial lake.',
    createSvgIllustration('Patagonia Fitz Roy', 'Southern Continental Ice Cap', 'patagonia'),
  )

  const mLofoten = await ensureMedia(
    'hero-lofoten.svg',
    'Lofoten Islands Maritime Ridge and Fjord Traverse',
    'Dramatic arctic fjord peaks rising directly out of the Norwegian Sea.',
    createSvgIllustration('Lofoten Odyssey', 'Arctic Maritime Ridges & Fjords', 'fjord'),
  )

  const mHauteRoute = await ensureMedia(
    'hero-haute-route.svg',
    'Valais 4,000m Haute Route Chamonix to Zermatt',
    'The iconic high alpine glacier traverse beneath the Matterhorn.',
    createSvgIllustration('Valais Haute Route', 'Chamonix to Zermatt Glacier Traverse', 'alpine'),
  )

  const mIceland = await ensureMedia(
    'hero-iceland.svg',
    'Icelandic Highlands and Landmannalaugar Volcanic Traverse',
    'Rhyolite mountains, steaming fumaroles, and black sand deserts.',
    createSvgIllustration('Iceland Highlands', 'Fjallabak Volcanic Wilderness', 'polar'),
  )

  // Itinerary detail images
  const mDay1 = await ensureMedia('day-spires.svg', 'Alpine Ascent Day', 'Ascent through sheer rock ledges.', createSvgIllustration('High Refuge Approach', 'Day 1 Elevation Push', 'alpine'))
  const mDay2 = await ensureMedia('day-glacier.svg', 'Glacier Crossing', 'Navigating crevasses and ice bridges.', createSvgIllustration('Glacial Basin', 'Day 2 Technical Traverse', 'polar'))
  const mDay3 = await ensureMedia('day-ridge.svg', 'Exposed Ridge Line', 'Secured cable sections along high col.', createSvgIllustration('Exposed Ridge', 'Day 3 Via Ferrata', 'alpine'))
  const mDay4 = await ensureMedia('day-refuge.svg', 'Historic High Refuge', 'Evening light across the alpine refuge.', createSvgIllustration('Refugio Sanctuary', 'Day 4 High Shelter', 'fjord'))

  // Author and Team Portraits
  const mElena = await ensureMedia('author-elena.svg', 'Elena Rostova Portrait', 'Lead Alpinist & Expedition Director', createSvgIllustration('Elena Rostova', 'IFMGA Guide · Zürich', 'portrait'))
  const mMarcus = await ensureMedia('author-marcus.svg', 'Marcus Vane Portrait', 'Polar Naturalist & Sea Kayak Specialist', createSvgIllustration('Marcus Vane', 'Arctic Specialist · Tromsø', 'portrait'))
  const mClara = await ensureMedia('author-clara.svg', 'Clara Lindqvist Portrait', 'High Alpine Guide & Glaciologist', createSvgIllustration('Clara Lindqvist', 'Glaciologist · Geneva', 'portrait'))
  const mSoren = await ensureMedia('team-soren.svg', 'Søren Krog Portrait', 'Chief of Field Safety & Navigation', createSvgIllustration('Søren Krog', 'Wilderness Paramedic', 'portrait'))
  const mAstrid = await ensureMedia('team-astrid.svg', 'Astrid Nygård Portrait', 'Expedition Geographer & Logistics Lead', createSvgIllustration('Astrid Nygård', 'Route Planner · Oslo', 'portrait'))

  // 2. Admin User
  console.log('Seeding administrative user...')
  const existingUsers = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: 'admin@celeste-expeditions.com',
      },
    },
  })

  let adminUserId: string
  if (existingUsers.docs.length === 0) {
    const adminUser = await payload.create({
      collection: 'users',
      data: {
        name: 'Elena Rostova',
        email: 'admin@celeste-expeditions.com',
        password: 'CelesteExpeditions2026!',
        role: 'admin',
      },
    })
    adminUserId = adminUser.id
    console.log('Created admin user: admin@celeste-expeditions.com')
  } else {
    adminUserId = existingUsers.docs[0].id
    console.log('Admin user already exists:', adminUserId)
  }

  // 3. Categories
  console.log('Seeding journal categories...')
  const categoriesData = [
    {
      name: 'High Alpine Traverses',
      slug: 'alpine-traverses',
      description: 'High-altitude ridges, via ferratas, and refuge-to-refuge journeys through the European Alps.',
    },
    {
      name: 'Polar & Arctic Routes',
      slug: 'polar-arctic',
      description: 'Glacial navigation, sea kayak expeditions, and polar bear monitoring across Svalbard and Greenland.',
    },
    {
      name: 'Field Craft & Navigation',
      slug: 'field-craft',
      description: 'Technical mountaineering insights, satellite meteorology, rope work, and equipment essays.',
    },
    {
      name: 'Refuge Gastronomy & Culture',
      slug: 'refuge-gastronomy',
      description: 'Culinary traditions, architectural design of high refugios, and wine cellars at 2,500 meters.',
    },
  ]

  const categoryMap = new Map<string, string>()
  for (const cat of categoriesData) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: cat.slug } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      categoryMap.set(cat.slug, existing.docs[0].id)
    } else {
      const created = await payload.create({
        collection: 'categories',
        data: cat,
      })
      categoryMap.set(cat.slug, created.id)
    }
  }

  // 4. Authors
  console.log('Seeding editorial authors...')
  const authorsData = [
    {
      name: 'Elena Rostova',
      role: 'Lead Alpinist & Expedition Director',
      credentials: 'IFMGA Mountain Guide · 18 Years Alpine Experience',
      bio: 'Elena has directed over eighty high-altitude traverses across the Valais, Bernese Oberland, and Brenta Dolomites. She specializes in small-rope technical teams and route safety.',
      avatar: mElena,
    },
    {
      name: 'Marcus Vane',
      role: 'Polar Naturalist & Sea Kayak Specialist',
      credentials: 'Master Mariner · Svalbard Guide Association Level III',
      bio: 'Marcus has spent fifteen seasons navigating the pack ice of Spitsbergen, Franz Josef Land, and East Greenland. His field work focuses on Arctic marine mammals and glaciological change.',
      avatar: mMarcus,
    },
    {
      name: 'Clara Lindqvist',
      role: 'High Alpine Guide & Glaciologist',
      credentials: 'PhD Glaciology (ETH Zürich) · Swiss Mountain Guide Aspirant',
      bio: 'Clara pairs rigorous academic research on cryospheric retreat with decade-long experience leading technical ski mountaineering and high alpine climbs across Europe.',
      avatar: mClara,
    },
  ]

  const authorMap = new Map<string, string>()
  for (const auth of authorsData) {
    const existing = await payload.find({
      collection: 'authors',
      where: { name: { equals: auth.name } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      authorMap.set(auth.name, existing.docs[0].id)
    } else {
      const created = await payload.create({
        collection: 'authors',
        data: auth,
      })
      authorMap.set(auth.name, created.id)
    }
  }

  // 5. Team Members
  console.log('Seeding team members...')
  const teamData = [
    {
      name: 'Elena Rostova',
      role: 'Expedition Director & Lead Guide',
      yearsExperience: 18,
      order: 1,
      specialty: 'Dolomites, Mont Blanc Massif & Valais',
      certifications: 'IFMGA / UIAGM Full Mountain Guide, Wilderness First Responder',
      bio: 'Co-founder of Celeste Expeditions. Elena oversees route design, guide accreditation, and custom private ascents.',
      photo: mElena,
    },
    {
      name: 'Marcus Vane',
      role: 'Head of Polar Operations',
      yearsExperience: 15,
      order: 2,
      specialty: 'Svalbard, Greenland & Arctic Ocean',
      certifications: 'Svalbard Guide Level III, Polar Navigation License, RYA Yachtmaster Offshore',
      bio: 'Leads our high-latitude nautical charters and glacier kayak programs with uncompromising environmental stewardship.',
      photo: mMarcus,
    },
    {
      name: 'Søren Krog',
      role: 'Chief of Field Safety & Navigation',
      yearsExperience: 14,
      order: 3,
      specialty: 'Nordic Fjords & Scandinavian Traverses',
      certifications: 'Nordic Ski Guide Instructor, Mountain Rescue Specialist',
      bio: 'Specialist in remote communication infrastructure, satellite weather forecasting, and technical alpine logistics.',
      photo: mSoren,
    },
    {
      name: 'Astrid Nygård',
      role: 'Director of Guest Concierge & Route Planning',
      yearsExperience: 11,
      order: 4,
      specialty: 'High Refuge Allocations & Bespoke Charters',
      certifications: 'Swiss Tourism Federation Master, Certified Sommelier (Alpine Terroirs)',
      bio: 'Manages our Zürich consultation desk, private refuge buyouts, and customized acclimatization programs.',
      photo: mAstrid,
    },
  ]

  for (const tm of teamData) {
    const existing = await payload.find({
      collection: 'team-members',
      where: { name: { equals: tm.name } },
      limit: 1,
    })
    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'team-members',
        data: tm,
      })
    }
  }

  // 6. Expedition Trips
  console.log('Seeding signature expedition trips...')
  const tripsData = [
    {
      title: 'The Brenta Dolomites High Traverse & Via delle Bocchette',
      slug: 'brenta-dolomites-high-traverse',
      status: 'published' as const,
      destination: 'Dolomites, Northern Italy',
      difficulty: 'Challenging' as const,
      duration: 7,
      maxGroupSize: 8,
      featured: true,
      pricing: { fromPrice: 4850, currency: 'USD' as const },
      heroImage: mDolomites,
      shortDescription: 'An iconic seven-day vertical sanctuary traverse across sheer limestone spires, historic mountain rifugios, and narrow rock ledges above the clouds.',
      overview: makeLexical([
        'Carved into the sheer vertical walls of the Brenta group, the Via delle Bocchette represents the pinnacle of European iron-way mountaineering. Rather than summiting individual peaks, this legendary traverse connects the entire massif along natural horizontal rock strata.',
        'Each evening concludes in historic high refugios perched above sea-level cloud banks, where multi-course Trentino dinners and cellar-aged wines accompany quiet sunset briefings. The group moves unhurriedly with an intimate 4:1 guest-to-guide ratio.',
      ]),
      highlights: [
        { icon: 'Mountain', title: 'Vertical Rock Ledges', description: 'Walk along hand-chiseled limestone shelves suspended 1,000 meters above the valley floor.' },
        { icon: 'Shield', title: '4:1 Guide Ratio', description: 'Certified IFMGA mountain guides oversee all clipped travel, equipment checks, and weather forecasts.' },
        { icon: 'Sun', title: 'Historic Rifugio Sanctuary', description: 'Stay in refuges known for warm alpine hospitality, wood-fired dining, and high-altitude cellars.' },
        { icon: 'Award', title: 'Cima Brenta Ledge', description: 'Complete the famed Bocchette Centrali section, Europe’s most revered via ferrata passage.' },
      ],
      availability: [
        { date: '2026-07-12', spotsLeft: 4, priceOverride: 4850 },
        { date: '2026-08-08', spotsLeft: 2, priceOverride: 5100 },
        { date: '2026-09-05', spotsLeft: 6, priceOverride: 4850 },
      ],
      itinerary: [
        {
          dayNumber: 1,
          title: 'Ascent to Rifugio Tuckett & Equipment Fitting',
          trekDuration: '3.5 Hours',
          accommodation: 'Rifugio Tuckett (2,272 m)',
          altitude: '2,272 m',
          activity: 'Acclimatization Trek & Via Ferrata Clinic',
          image: mDay1,
          description: makeLexical([
            'Gather at our Madonna di Campiglio base lodge for a private gear check and technical harness fitting. Ascend through larch forests and scree slopes toward Rifugio Tuckett.',
            'An afternoon clinic introduces via ferrata lanyard clipping techniques, self-arrest ropes, and high alpine etiquette before dinner.',
          ]),
        },
        {
          dayNumber: 2,
          title: 'Bocchette Alte: High Traverse Beneath Cima Brenta',
          trekDuration: '6 Hours',
          accommodation: 'Rifugio Alimonta (2,580 m)',
          altitude: '3,000 m',
          activity: 'Technical Iron-Way Traversal',
          image: mDay2,
          description: makeLexical([
            'Depart at dawn along iron ladders leading into the highest strata of the Brenta group. Cross exposed rock shelves with panoramic views toward Lake Garda and the Adamello glaciers.',
            'Descend the Vedretta dei Brentei glacier basin to reach Rifugio Alimonta in time for afternoon espresso.',
          ]),
        },
        {
          dayNumber: 3,
          title: 'Bocchette Centrali & Campanile Basso',
          trekDuration: '5.5 Hours',
          accommodation: 'Rifugio Pedrotti (2,491 m)',
          altitude: '2,620 m',
          activity: 'Ledge Traversal Along Iconic Spires',
          image: mDay3,
          description: makeLexical([
            'Today navigates the crown jewel of the Brenta Dolomites: the Bocchette Centrali. Skirt the dizzying base of the needle-thin Campanile Basso spire.',
            'Ledges as narrow as fifty centimeters are secured by steel cables, offering unmatched photographic perspectives.',
          ]),
        },
        {
          dayNumber: 4,
          title: 'Descent via Val delle Seghe & Farewell Lunch',
          trekDuration: '4 Hours',
          accommodation: 'Grand Hotel Molveno',
          altitude: '864 m',
          activity: 'Valley Descent & Celebration',
          image: mDay4,
          description: makeLexical([
            'A gentle morning descent through pine amphitheaters down to the turquoise shores of Lake Molveno.',
            'Conclude with a lakeside celebratory luncheon featuring local Trentino specialties and alpine wines.',
          ]),
        },
      ],
      includes: [
        { item: 'Certified IFMGA mountain guide coverage (maximum 4:1 ratio)' },
        { item: '6 nights accommodation in premium alpine refugios and 5-star lakeside hotel' },
        { item: 'All multi-course dinners, breakfasts, and trail lunches throughout' },
        { item: 'High-end via ferrata kit: Petzl harness, energy absorber, and helmet' },
        { item: 'Private luxury Mercedes-Benz Sprinter transfers from Verona or Venice airport' },
        { item: 'Garmin inReach satellite SOS monitoring and expedition luggage transport' },
      ],
      excludes: [
        { item: 'International airfare to Italy' },
        { item: 'Personal technical mountain clothing and boots' },
        { item: 'Discretionary gratuities for guides and refuge hosts' },
      ],
      essentialInfo: [
        {
          title: 'Physical Conditioning & Experience Required',
          content: makeLexical([
            'Guests should possess surefootedness on exposed rock and the aerobic stamina to hike 5 to 7 hours per day with a 7 kg pack. While previous via ferrata experience is helpful, thorough technical instruction is provided on Day 1.',
          ]),
        },
        {
          title: 'Packing & Alpine Weather Protocol',
          content: makeLexical([
            'High mountain weather in the Dolomites can shift rapidly from warm sunshine to brisk alpine breezes. Layering systems including Gore-Tex shell, merino wool baselayers, and sturdy Vibram-soled boots are mandatory.',
          ]),
        },
      ],
      faqs: [
        {
          question: 'Are private room accommodations available at the refugios?',
          answer: makeLexical([
            'Yes. Celeste holds priority allotments for private 2-person and 4-person rooms at Rifugio Tuckett and Rifugio Alimonta, avoiding standard open dormitory arrangements.',
          ]),
        },
        {
          question: 'What is the minimum age for this traverse?',
          answer: makeLexical([
            'Participants must be at least 16 years of age. For younger travelers, we offer bespoke family routes in the Tre Cime region.',
          ]),
        },
      ],
      map: {
        latitude: 46.1667,
        longitude: 10.9,
        zoom: 11,
        routeDescription: 'Circular high traverse through the Central Brenta Group starting at Madonna di Campiglio and culminating above Lake Molveno.',
        markers: [
          { dayNumber: 1, title: 'Rifugio Tuckett', latitude: 46.1912, longitude: 10.8715, description: 'Base refuge & gear clinic' },
          { dayNumber: 2, title: 'Cima Brenta Ledge', latitude: 46.1834, longitude: 10.8988, description: 'Bocchette Alte highest section' },
          { dayNumber: 3, title: 'Campanile Basso', latitude: 46.1742, longitude: 10.9023, description: 'Iconic needle pinnacle traverse' },
          { dayNumber: 4, title: 'Lake Molveno', latitude: 46.1425, longitude: 10.9631, description: 'Lakeside celebration finish' },
        ],
      },
    },
    {
      title: 'Svalbard Arctic Fjord & Glacial Kayak Expedition',
      slug: 'svalbard-arctic-fjord-expedition',
      status: 'published' as const,
      destination: 'Svalbard & Spitsbergen, Norway',
      difficulty: 'Strenuous' as const,
      duration: 10,
      maxGroupSize: 6,
      featured: true,
      pricing: { fromPrice: 8900, currency: 'USD' as const },
      heroImage: mSvalbard,
      shortDescription: 'Ten days navigating ice-strewn fjords, calved blue glaciers, and polar wildlife under the 24-hour Arctic midnight sun.',
      overview: makeLexical([
        'Beyond the 78th parallel north, Svalbard represents one of Earth’s final true frontiers. This expedition pairs deep-wilderness sea kayaking along active tidewater glaciers with mobile camp setups on pristine Arctic tundras.',
        'Under the guidance of polar naturalists equipped with satellite telemetry and polar bear perimeter protocols, you will glide silently past bearded seals, walrus colonies, and beluga pods.',
      ]),
      highlights: [
        { icon: 'Compass', title: 'Tidewater Glacier Paddling', description: 'Paddle within safe acoustic distance of active calving glacier faces in Isfjorden.' },
        { icon: 'Shield', title: 'Polar Bear Safety Protocol', description: '24-hour perimeter trip-wire systems and certified Svalbard guides with flare/rifle safety.' },
        { icon: 'Sparkles', title: '24-Hour Midnight Sun', description: 'Experience the otherworldly clarity and silence of Arctic daylight around the clock.' },
        { icon: 'Award', title: 'Small Group Cap: 6 Guests', description: 'Strict 3:1 guest-to-guide ratio ensuring rapid mobility and minimal ecological footprint.' },
      ],
      availability: [
        { date: '2026-06-20', spotsLeft: 3, priceOverride: 8900 },
        { date: '2026-07-15', spotsLeft: 1, priceOverride: 9200 },
        { date: '2026-08-01', spotsLeft: 5, priceOverride: 8900 },
      ],
      itinerary: [
        {
          dayNumber: 1,
          title: 'Longyearbyen Briefing & Zodiac Transit',
          trekDuration: '2 Hours',
          accommodation: 'Basecamp Hotel Longyearbyen',
          altitude: '15 m',
          activity: 'Expedition Briefing & Drysuit Fitting',
          image: mDay2,
          description: makeLexical(['Meet in Longyearbyen for safety orientation and personal Kokatat drysuit fitting. Zodiac transfer to our remote fjord base.']),
        },
        {
          dayNumber: 2,
          title: 'Billefjorden Glacial Front Paddling',
          trekDuration: '5 Hours',
          accommodation: 'Mobile Arctic Dome Camp',
          altitude: '5 m',
          activity: 'Sea Kayaking Past Icebergs',
          image: mDay3,
          description: makeLexical(['First open-water crossing among brash ice and sculptured bergs. Watch for Arctic foxes on the moraine slopes.']),
        },
      ],
      includes: [
        { item: 'Top-tier expedition sea kayaks (P&H / Valley) and Kokatat Gore-Tex drysuits' },
        { item: 'All polar safety equipment, flare kits, satellite trackers, and camp alarms' },
        { item: 'Expedition dining prepared with premium Scandinavian provisions' },
        { item: 'Zodiac charter transfers to remote fjord drops' },
      ],
      excludes: [
        { item: 'Flights to Longyearbyen (LYR)' },
        { item: 'Personal thermal base layers' },
      ],
      essentialInfo: [
        {
          title: 'Cold Water Safety & Cold Tolerance',
          content: makeLexical(['Participants must be confident swimmers and comfortable in drysuits. Paddling distance averages 12 to 18 km daily.']),
        },
      ],
      faqs: [
        {
          question: 'What temperatures should we expect in July?',
          answer: makeLexical(['Daytime temperatures generally hover between 3°C and 8°C with calm sea conditions inside the fjords.']),
        },
      ],
      map: {
        latitude: 78.2232,
        longitude: 15.6267,
        zoom: 9,
        routeDescription: 'Exploration of Isfjorden, Billefjorden, and the Nordenskiöldbreen glacier wall.',
        markers: [
          { dayNumber: 1, title: 'Longyearbyen', latitude: 78.2232, longitude: 15.6267, description: 'Expedition HQ & Zodiac departure' },
          { dayNumber: 2, title: 'Nordenskiöldbreen Face', latitude: 78.6712, longitude: 16.9241, description: 'Glacier paddling zone' },
        ],
      },
    },
    {
      title: 'Patagonia Fitz Roy & Southern Ice Cap Traverse',
      slug: 'patagonia-fitz-roy-traverse',
      status: 'published' as const,
      destination: 'Los Glaciares & Patagonia, Argentina',
      difficulty: 'Strenuous' as const,
      duration: 12,
      maxGroupSize: 8,
      featured: true,
      pricing: { fromPrice: 7600, currency: 'USD' as const },
      heroImage: mPatagonia,
      shortDescription: 'Witness the golden dawn over Monte Fitz Roy and Cerro Torre before venturing onto the immense continental ice sheets of the Southern Patagonian Ice Field.',
      overview: makeLexical([
        'Nowhere else on Earth do granite monoliths slice the sky with such ferocious elegance. This journey combines the famed trails of Los Glaciares National Park with a technical crossing through Paso Marconi onto the inland continental ice plateau.',
        'Evenings alternate between eco-luxury yurt lodges in El Chaltén and high-altitude mountain tents secured against the legendary winds of the Roaring Forties.',
      ]),
      highlights: [
        { icon: 'Mountain', title: 'Paso Marconi Ice Cap Crossing', description: 'Step onto the Southern Patagonian Ice Field, the world’s third-largest ice expanse.' },
        { icon: 'Sparkles', title: 'Laguna de los Tres Dawn', description: 'Photographic golden-hour illumination of Fitz Roy’s sheer east face.' },
        { icon: 'Shield', title: 'Glacier Guides & Snowshoes', description: 'Roped travel protocols managed by local UIAGM guides with decades of Patagonian weather instincts.' },
      ],
      availability: [
        { date: '2026-11-10', spotsLeft: 4, priceOverride: 7600 },
        { date: '2026-12-05', spotsLeft: 3, priceOverride: 7900 },
        { date: '2027-01-14', spotsLeft: 6, priceOverride: 7600 },
      ],
      itinerary: [
        {
          dayNumber: 1,
          title: 'El Calafate to El Chaltén Scenic Drive',
          trekDuration: '3 Hours',
          accommodation: 'Chaltén Camp Eco-Lodge',
          altitude: '450 m',
          activity: 'Welcome Dinner & Route Briefing',
          image: mDay1,
          description: makeLexical(['Private transfer along Lake Viedma with views of the Fitz Roy skyline. Evening welcome dinner featuring Argentine asado and Malbec.']),
        },
      ],
      includes: [{ item: 'Private transfers from El Calafate (FTE)' }, { item: 'Full camping equipment and luxury yurt nights' }],
      excludes: [{ item: 'International airfare to Buenos Aires' }],
      essentialInfo: [{ title: 'Wind and Weather Protocol', content: makeLexical(['Patagonian weather requires flexible scheduling and top-tier windproof outerwear.']) }],
      faqs: [{ question: 'How fit do I need to be?', answer: makeLexical(['You should be capable of hiking 6 to 8 hours with elevation gains of 800 meters.']) }],
      map: {
        latitude: -49.3315,
        longitude: -72.8864,
        zoom: 10,
        routeDescription: 'El Chaltén valley traverse and high continental glacier push.',
        markers: [{ dayNumber: 1, title: 'El Chaltén', latitude: -49.3315, longitude: -72.8864, description: 'Base town' }],
      },
    },
    {
      title: 'Lofoten Islands Maritime Ridge & Fjord Odyssey',
      slug: 'lofoten-islands-maritime-odyssey',
      status: 'published' as const,
      destination: 'Nordland & Lofoten, Norway',
      difficulty: 'Moderate' as const,
      duration: 6,
      maxGroupSize: 10,
      featured: true,
      pricing: { fromPrice: 3950, currency: 'USD' as const },
      heroImage: mLofoten,
      shortDescription: 'Traverse sheer granite knife-edges rising 800 meters directly out of turquoise Arctic seas, resting each night in restored historic rorbuer fishing cabins.',
      overview: makeLexical([
        'Rising like teeth from the Vestfjorden, the Lofoten archipelago offers one of Europe’s most dramatic alpine-maritime landscapes. Scramble along panoramic ridgelines with 360-degree ocean views.',
        'At dusk, return to private harborside rorbuer for fresh Arctic cod, sauna sessions, and cold-plunge sea swims.',
      ]),
      highlights: [
        { icon: 'Compass', title: 'Reinebringen & Ryten Ridges', description: 'Iconic aerial vantage points overlooking Kvalvika Beach and Reine Fjord.' },
        { icon: 'Sun', title: 'Restored Rorbu Lodging', description: 'Private red timber cabins perched on stilts over calm tidal harbors.' },
      ],
      availability: [
        { date: '2026-06-10', spotsLeft: 5, priceOverride: 3950 },
        { date: '2026-07-04', spotsLeft: 2, priceOverride: 4200 },
        { date: '2026-08-18', spotsLeft: 7, priceOverride: 3950 },
      ],
      itinerary: [
        {
          dayNumber: 1,
          title: 'Arrival in Svolvær & Henningsvær Fishermen Village',
          trekDuration: '2.5 Hours',
          accommodation: 'Henningsvær Rorbuer',
          altitude: '10 m',
          activity: 'Coastal walk and sauna',
          image: mDay4,
          description: makeLexical(['Meet your guide at Svolvær airport and transfer to Henningsvær village. Evening sauna and sea dip.']),
        },
      ],
      includes: [{ item: '5 nights in authentic private rorbuer' }, { item: 'All transfers by private electric van' }],
      excludes: [{ item: 'Flights to Svolvær / Leknes' }],
      essentialInfo: [{ title: 'Footwear & Muddy Trails', content: makeLexical(['Waterproof mid-cut trekking boots with deep tread are crucial for Lofoten peat and granite slabs.']) }],
      faqs: [{ question: 'Is midnight sun visible?', answer: makeLexical(['Yes, throughout June and July the sun never dips below the horizon.']) }],
      map: {
        latitude: 68.1566,
        longitude: 13.7533,
        zoom: 9,
        routeDescription: 'Traverse of Austvågøya, Vestvågøya, Flakstadøya, and Moskenesøya.',
        markers: [{ dayNumber: 1, title: 'Henningsvær', latitude: 68.1533, longitude: 14.2044, description: 'Harbor base' }],
      },
    },
    {
      title: 'The Classic Haute Route: Chamonix to Zermatt',
      slug: 'valais-haute-route-chamonix-zermatt',
      status: 'published' as const,
      destination: 'Pennine Alps, Switzerland & France',
      difficulty: 'Challenging' as const,
      duration: 8,
      maxGroupSize: 6,
      featured: false,
      pricing: { fromPrice: 5400, currency: 'USD' as const },
      heroImage: mHauteRoute,
      shortDescription: 'The world’s most celebrated mountaineering traverse between the granite needle spires of Mont Blanc and the solitary pyramid of the Matterhorn.',
      overview: makeLexical([
        'First conquered on foot in 1861 by members of the British Alpine Club, the Haute Route remains the gold standard of high-level alpine trekking. Traverse high glaciated cols and sleep in dramatic Swiss huts.',
      ]),
      highlights: [
        { icon: 'Mountain', title: 'Matterhorn Arrival', description: 'Descend into Zermatt with the unhindered north face of the Matterhorn ahead.' },
        { icon: 'Shield', title: 'Swiss Alpine Cabane Stays', description: 'Overnight at Cabane du Trient and Cabane de Prafleuri.' },
      ],
      availability: [
        { date: '2026-07-18', spotsLeft: 3, priceOverride: 5400 },
        { date: '2026-08-12', spotsLeft: 4, priceOverride: 5400 },
        { date: '2026-09-02', spotsLeft: 5, priceOverride: 5400 },
      ],
      itinerary: [
        {
          dayNumber: 1,
          title: 'Chamonix to Trient via Col de Balme',
          trekDuration: '5 Hours',
          accommodation: 'Refuge du Trient',
          altitude: '2,200 m',
          activity: 'Border crossing France to Switzerland',
          image: mDay1,
          description: makeLexical(['Depart Chamonix with views of the Aiguille du Tour, crossing into the Swiss Valais.']),
        },
      ],
      includes: [{ item: 'IFMGA certified Swiss mountain guide' }, { item: 'Cabane half-board lodging' }],
      excludes: [{ item: 'Personal alpine gear' }],
      essentialInfo: [{ title: 'Glacier Gear', content: makeLexical(['Lightweight crampons and climbing harness are required for the snow cols.']) }],
      faqs: [{ question: 'What is the daily elevation gain?', answer: makeLexical(['Between 900 and 1,200 meters of ascent per day.']) }],
      map: {
        latitude: 46.0207,
        longitude: 7.7491,
        zoom: 9,
        routeDescription: 'Chamonix to Zermatt through the Pennine Alps.',
        markers: [{ dayNumber: 1, title: 'Chamonix', latitude: 45.9237, longitude: 6.8694, description: 'Start' }],
      },
    },
    {
      title: 'Icelandic Highlands & Landmannalaugar Traverse',
      slug: 'icelandic-highlands-volcanic-wilderness',
      status: 'published' as const,
      destination: 'Fjallabak & Highlands, Iceland',
      difficulty: 'Moderate' as const,
      duration: 5,
      maxGroupSize: 10,
      featured: false,
      pricing: { fromPrice: 3200, currency: 'USD' as const },
      heroImage: mIceland,
      shortDescription: 'Venture deep into the raw volcanic heart of Iceland: steaming obsidian fields, rainbow rhyolite ridges, and geothermal hot springs.',
      overview: makeLexical([
        'A journey into a primordial world where earth is still being formed. Trek between natural geothermal hot springs and obsidian desert valleys.',
      ]),
      highlights: [
        { icon: 'Sun', title: 'Geothermal Bathing', description: 'Soak in wild thermal rivers after high-ridge passes.' },
      ],
      availability: [
        { date: '2026-07-08', spotsLeft: 6, priceOverride: 3200 },
        { date: '2026-08-04', spotsLeft: 4, priceOverride: 3200 },
        { date: '2026-08-22', spotsLeft: 8, priceOverride: 3200 },
      ],
      itinerary: [
        {
          dayNumber: 1,
          title: 'Reykjavik Super-Jeep Transfer & Landmannalaugar',
          trekDuration: '3 Hours',
          accommodation: 'Highland Mountain Lodge',
          altitude: '600 m',
          activity: 'Obsidian lava field hike',
          image: mDay2,
          description: makeLexical(['Super-jeep transit across glacial rivers into the Fjallabak Nature Reserve.']),
        },
      ],
      includes: [{ item: 'Super-Jeep 4x4 expedition logistics' }, { item: 'Mountain hut accommodations' }],
      excludes: [{ item: 'Flights to Keflavik (KEF)' }],
      essentialInfo: [{ title: 'River Crossings', content: makeLexical(['Neoprene wading shoes and trekking poles are mandatory for glacial stream crossings.']) }],
      faqs: [{ question: 'Are huts heated?', answer: makeLexical(['Yes, all reserve huts feature geothermal or wood-stove heating.']) }],
      map: {
        latitude: 63.9912,
        longitude: -19.0601,
        zoom: 9,
        routeDescription: 'Landmannalaugar to Þórsmörk traverse.',
        markers: [{ dayNumber: 1, title: 'Landmannalaugar', latitude: 63.9912, longitude: -19.0601, description: 'Geothermal camp' }],
      },
    },
  ]

  const tripIdMap = new Map<string, string>()
  for (const t of tripsData) {
    const existing = await payload.find({
      collection: 'trips',
      where: { slug: { equals: t.slug } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      tripIdMap.set(t.slug, existing.docs[0].id)
      console.log(`Trip ${t.slug} already exists: ${existing.docs[0].id}`)
    } else {
      const created = await payload.create({
        collection: 'trips',
        data: t,
      })
      tripIdMap.set(t.slug, created.id)
      console.log(`Created trip: ${t.title} (${created.id})`)
    }
  }

  // Link related trips
  const dolomitesId = tripIdMap.get('brenta-dolomites-high-traverse')
  const svalbardId = tripIdMap.get('svalbard-arctic-fjord-expedition')
  const patagoniaId = tripIdMap.get('patagonia-fitz-roy-traverse')
  const lofotenId = tripIdMap.get('lofoten-islands-maritime-odyssey')
  const hauteRouteId = tripIdMap.get('valais-haute-route-chamonix-zermatt')
  const icelandId = tripIdMap.get('icelandic-highlands-volcanic-wilderness')

  if (dolomitesId && hauteRouteId && patagoniaId) {
    await payload.update({
      collection: 'trips',
      id: dolomitesId,
      data: {
        relatedTrips: [hauteRouteId, patagoniaId],
      },
    })
  }

  if (svalbardId && lofotenId && icelandId) {
    await payload.update({
      collection: 'trips',
      id: svalbardId,
      data: {
        relatedTrips: [lofotenId, icelandId],
      },
    })
  }

  // 7. Journal Posts
  console.log('Seeding journal posts...')
  const elenaId = authorMap.get('Elena Rostova') || adminUserId
  const marcusId = authorMap.get('Marcus Vane') || adminUserId
  const claraId = authorMap.get('Clara Lindqvist') || adminUserId

  const catAlpine = categoryMap.get('alpine-traverses')
  const catPolar = categoryMap.get('polar-arctic')
  const catCraft = categoryMap.get('field-craft')
  const catRefuge = categoryMap.get('refuge-gastronomy')

  const postsData = [
    {
      title: 'The Architecture of Route Design in Glaciated Terrains',
      slug: 'architecture-of-route-design-in-glaciated-terrains',
      status: 'published' as const,
      author: elenaId,
      categories: [catAlpine, catCraft].filter(Boolean) as string[],
      publishedDate: '2026-08-15',
      readTime: '7 min read',
      featuredImage: mHauteRoute,
      excerpt: 'How satellite interferometry, seasonal snow bridges, and intuitive mountain instincts converge when tracing high traverses across changing alpine glaciers.',
      content: makeLexical([
        'In the golden era of alpine mountaineering, route-finding was an art dictated by barometer readings, ridge silhouettes, and the instinctual reckoning of local guides.',
        'Today, while those fundamental senses remain irreplaceable, route planning in glaciated environments has evolved into a disciplined architectural dialogue between satellite radar data and micro-meteorology.',
        'When guiding groups across high cols such as the Col du Chardonnet or the glacier plateau beneath Cima Brenta, our route decisions begin forty-eight hours prior with thermal imaging scans of recent crevassing.',
      ]),
    },
    {
      title: 'Midnight Light and Cold Open Waters: A Svalbard Kayak Dossier',
      slug: 'midnight-light-and-cold-open-waters-svalbard',
      status: 'published' as const,
      author: marcusId,
      categories: [catPolar, catCraft].filter(Boolean) as string[],
      publishedDate: '2026-07-28',
      readTime: '6 min read',
      featuredImage: mSvalbard,
      excerpt: 'Notes from eighty miles inside the Spitsbergen fjord network: managing drysuit microclimates, wildlife telemetry, and paddling beneath the 2am sun.',
      content: makeLexical([
        'At 78 degrees North, daylight is not an event with a beginning and an end; it is an omnipresent silver mantle that suspends the normal cadences of fatigue.',
        'Gliding twenty feet off the acoustic perimeter of the Nordenskiöldbreen glacier wall, the only sounds are the rhythmic dip of fiberglass blades and the gunshot cracks of internal ice calving.',
      ]),
    },
    {
      title: 'Packing for the 4,000-Meter Horizon: Essential Equipment Guide',
      slug: 'packing-for-the-4000-meter-horizon-equipment-guide',
      status: 'published' as const,
      author: claraId,
      categories: [catCraft].filter(Boolean) as string[],
      publishedDate: '2026-06-12',
      readTime: '8 min read',
      featuredImage: mDolomites,
      excerpt: 'A meticulous breakdown of ounce-by-ounce pack curation for multi-day alpine traverses where weight and warmth are non-negotiable partners.',
      content: makeLexical([
        'Every ounce carried over a 1,200-meter vertical col must earn its place twice. Our packing doctrine balances lightweight alpine mobility with uncompromising emergency margin.',
      ]),
    },
    {
      title: 'Refugio Culture: The High Gastronomy of the Italian Dolomites',
      slug: 'refugio-culture-high-gastronomy-dolomites',
      status: 'published' as const,
      author: elenaId,
      categories: [catAlpine, catRefuge].filter(Boolean) as string[],
      publishedDate: '2026-05-04',
      readTime: '5 min read',
      featuredImage: mDay4,
      excerpt: 'Beyond the steel cables and vertical rock faces lies one of Europe’s most civilized traditions: handmade polenta, mountain cheeses, and cellars at 2,500 meters.',
      content: makeLexical([
        'To arrive at Rifugio Alimonta after six hours clipped to steel cables is to experience alpine civilization at its absolute pinnacle. A warm hearth, steaming plates of canederli in capon broth, and aged Teroldego Rotaliano greet tired climbers.',
      ]),
    },
  ]

  for (const post of postsData) {
    const existing = await payload.find({
      collection: 'posts',
      where: { slug: { equals: post.slug } },
      limit: 1,
    })
    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'posts',
        data: post,
      })
      console.log(`Created post: ${post.title}`)
    }
  }

  // 8. Testimonials
  console.log('Seeding guest testimonials...')
  const testimonialsData = [
    {
      guestName: 'Dr. Henrik Lindholm',
      guestLocation: 'Stockholm, Sweden',
      rating: 5,
      featured: true,
      trip: dolomitesId,
      travelDate: 'Autumn 2025',
      quote: 'The Brenta Dolomites traverse orchestrated by Celeste surpassed every expectation. The 4:1 guide ratio made the sheer exposed ledges feel serene and secure, while the private rooms at Rifugio Tuckett were an alpine dream.',
      avatar: mElena,
    },
    {
      guestName: 'Eleanor Vance-Sterling',
      guestLocation: 'Geneva, Switzerland',
      rating: 5,
      featured: true,
      trip: svalbardId,
      travelDate: 'Summer 2025',
      quote: 'Paddling alongside blue ice walls in Spitsbergen with Marcus as our naturalist felt like stepping onto another planet. Uncompromising safety, exquisite camp dinners, and total silence.',
      avatar: mMarcus,
    },
    {
      guestName: 'Julian & Beatrice Thorne',
      guestLocation: 'London, United Kingdom',
      rating: 5,
      featured: true,
      trip: patagoniaId,
      travelDate: 'January 2026',
      quote: 'Watching the sunrise strike Monte Fitz Roy from Laguna de los Tres with our private guide was the single most transcendent travel moment of our lives. The logistics were flawless.',
      avatar: mClara,
    },
  ]

  for (const t of testimonialsData) {
    const existing = await payload.find({
      collection: 'testimonials',
      where: { guestName: { equals: t.guestName } },
      limit: 1,
    })
    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'testimonials',
        data: t,
      })
    }
  }

  // 9. Globals: SiteSettings
  console.log('Updating SiteSettings global...')
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'Celeste Expeditions',
      tagline: 'Architectural Alpine & Polar Voyages',
      logo: mDolomites,
      contactInfo: {
        email: 'concierge@celeste-expeditions.com',
        bookingsEmail: 'bookings@celeste-expeditions.com',
        phone: '+41 44 580 29 40',
        emergencyPhone: '+41 44 580 29 99',
        address: 'Bahnhofstrasse 42, 8001 Zürich, Switzerland',
        officeHours: 'Mon – Sat · 08:00 – 20:00 CET',
        latitude: 47.3717,
        longitude: 8.5386,
      },
      socials: [
        { platform: 'Instagram', handle: '@celeste.expeditions', url: 'https://instagram.com' },
        { platform: 'Substack', handle: 'The Celeste Journal', url: 'https://substack.com' },
        { platform: 'LinkedIn', handle: 'Celeste Expeditions AG', url: 'https://linkedin.com' },
      ],
      footer: {
        description: 'Celeste Expeditions crafts small-group and private luxury voyages across the European Alps, Arctic archipelagos, and Patagonian ice fields. Headquartered in Zürich.',
        copyrightText: '© 2026 Celeste Expeditions AG. All rights reserved. Registered Swiss Tour Operator CHE-419.821.092.',
        certifications: [
          { label: 'IFMGA / UIAGM Certified Guides' },
          { label: 'Swiss Tourism Federation Quality Label' },
          { label: 'IAATO & AECO Polar Tourism Member' },
          { label: '1% For The Planet Alpine Partner' },
        ],
      },
      aboutPage: {
        heroSubtitle: 'OUR HERITAGE & ETHOS',
        heroTitle: 'Crafted by Alpinists, Polar Navigators, and Cultural Stewards',
        storyHeadline: 'Precision Swiss Logistics Meet Unhurried Wilderness Immersion',
        storyLead: 'Founded in Zürich by a collective of IFMGA mountain guides and polar researchers, Celeste Expeditions was born from a desire to strip away the mass-tourism veneer of modern adventure travel.',
        storyParagraphs: [
          { paragraph: 'We believe genuine luxury in wild landscapes is defined by silence, small groups, unhurried pacing, and access to remote refuges that cannot be booked on standard consumer platforms.' },
          { paragraph: 'Every expedition is limited to 6 to 10 travelers, led by guides who live in the regions they navigate. From custom high-altitude menu design to 24-hour satellite safety tracking, nothing is left to chance.' },
        ],
        stats: [
          { value: '18+', label: 'Years of Field Leadership', detail: 'Guiding across 4 continents' },
          { value: '4:1', label: 'Guest to Guide Ratio', detail: 'The safest in high alpine operations' },
          { value: '100%', label: 'Zero-Trace Commitment', detail: 'Carbon offset & pack-out protocol' },
          { value: '98.6%', label: 'Guest Return Rate', detail: 'Within three seasons' },
        ],
        values: [
          { icon: 'Shield', title: 'Absolute Safety & Discretion', description: 'Certified IFMGA mountain guides, dedicated satellite SOS infrastructure, and private chartered logistics.' },
          { icon: 'Compass', title: 'Route Authorship', description: 'We design our own lines across rock, ice, and fjord waters rather than following generic tourist circuits.' },
          { icon: 'Sparkles', title: 'Sanctuary & High Gastronomy', description: 'Curated alpine refuges, wood-fired Nordic saunas, and locally sourced field cuisine.' },
        ],
      },
      legalPages: {
        privacyLastUpdated: 'September 1, 2026',
        privacySections: [
          {
            heading: '1. Information We Collect',
            body: 'Celeste Expeditions collects personal data provided during reservation inquiries, medical self-assessments, and newsletter subscriptions. We do not sell or monetize personal information.',
          },
          {
            heading: '2. Medical & Emergency Contacts',
            body: 'For expeditions involving glaciated or remote polar environments, we maintain strictly confidential health profiles and satellite rescue contact records, accessible only to your assigned guide and chief medical officer.',
          },
        ],
        termsLastUpdated: 'September 1, 2026',
        termsSections: [
          {
            heading: '1. Booking & Deposit Terms',
            body: 'A deposit of 25% confirms reservation on all scheduled departures. Balances are due 60 days prior to departure. Private charters are subject to custom contracts.',
          },
          {
            heading: '2. Weather & Route Adjustments',
            body: 'In high alpine and polar terrains, mountain guides retain sovereign authority to modify itineraries in the event of extreme meteorological conditions, crevasse shifts, or avalanche hazard.',
          },
        ],
      },
    },
  })

  // 10. Globals: Navigation
  console.log('Updating Navigation global...')
  await payload.updateGlobal({
    slug: 'navigation',
    data: {
      headerItems: [
        { label: 'Expeditions', href: '/trips', description: 'Curated alpine, polar & fjord voyages' },
        { label: 'About Celeste', href: '/about', description: 'Our heritage, guides & philosophy' },
        { label: 'Journal', href: '/blog', description: 'Field notes, route design & gear guides' },
        { label: 'Concierge', href: '/contact', description: 'Private inquiries & custom dossiers' },
      ],
      ctaButton: {
        label: 'Explore Expeditions',
        href: '/trips',
      },
      footerColumns: [
        {
          title: 'Expeditions',
          links: [
            { label: 'Brenta Dolomites High Traverse', href: '/trips/brenta-dolomites-high-traverse' },
            { label: 'Svalbard Arctic Fjord Kayak', href: '/trips/svalbard-arctic-fjord-expedition' },
            { label: 'Patagonia Fitz Roy Traverse', href: '/trips/patagonia-fitz-roy-traverse' },
            { label: 'Lofoten Islands Maritime Odyssey', href: '/trips/lofoten-islands-maritime-odyssey' },
            { label: 'All Scheduled Expeditions', href: '/trips' },
          ],
        },
        {
          title: 'Field Journal',
          links: [
            { label: 'Route Design in Glaciated Terrains', href: '/blog/architecture-of-route-design-in-glaciated-terrains' },
            { label: 'Svalbard Cold Water Kayak Dossier', href: '/blog/midnight-light-and-cold-open-waters-svalbard' },
            { label: 'Packing for the 4,000-Meter Horizon', href: '/blog/packing-for-the-4000-meter-horizon-equipment-guide' },
            { label: 'Refugio Gastronomy in the Dolomites', href: '/blog/refugio-culture-high-gastronomy-dolomites' },
          ],
        },
        {
          title: 'Concierge & Legal',
          links: [
            { label: 'Zürich Concierge Desk', href: '/contact' },
            { label: 'About Celeste Expeditions', href: '/about' },
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Service', href: '/terms' },
          ],
        },
      ],
    },
  })

  // 11. Globals: Homepage
  console.log('Updating Homepage global...')
  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      hero: {
        badge: '2026 / 2027 SIGNATURE & PRIVATE EXPEDITIONS',
        title: 'Architectural Journeys Across High Alpine & Polar Horizons',
        subtitle: 'Bespoke small-group and private mountaineering, fjord traverses, and polar voyages crafted with precision Swiss logistics and unhurried wilderness immersion.',
        primaryCtaLabel: 'Explore All Expeditions',
        primaryCtaHref: '/trips',
        secondaryCtaLabel: 'Speak With a Specialist',
        secondaryCtaHref: '/contact',
        heroImage: mDolomites,
        highlights: [
          { value: '4:1', label: 'Guest to Guide Ratio' },
          { value: '8 Max', label: 'Travelers Per Group' },
          { value: '18+', label: 'Years Field Mastery' },
          { value: '100%', label: 'IFMGA / UIAGM Guides' },
        ],
      },
      featuredTripsSection: {
        eyebrow: 'CURATED DEPARTURES',
        heading: 'Signature Expeditions for the Coming Season',
        subheading: 'Each journey is meticulously paced, limited to small teams, and supported by private refuge allocations and dedicated safety protocols.',
      },
      whyUsSection: {
        eyebrow: 'THE CELESTE STANDARD',
        heading: 'Engineered for Depth, Calm, and Uncompromising Field Craft',
        subheading: 'We dismantle the hurried pace of conventional tourism in favor of deep immersion, architectural mountain sanctuaries, and private logistics.',
        pillars: [
          {
            icon: 'Compass',
            metric: 'Private Lines',
            title: 'Sovereign Route Design',
            description: 'We do not follow commercial crowds. Our expedition leaders scout custom ridges, secluded fjord branches, and private refuges.',
          },
          {
            icon: 'Shield',
            metric: '100% Certified',
            title: 'IFMGA Mountain Leadership',
            description: 'Every high-angle route is helmed by fully certified IFMGA/UIAGM guides equipped with real-time satellite telemetry and rescue protocols.',
          },
          {
            icon: 'Award',
            metric: '6 to 8 Guests',
            title: 'Intimate Group Geometry',
            description: 'Small groups ensure swift mountain mobility, minimal environmental impact, and quiet evenings around high alpine dining tables.',
          },
          {
            icon: 'Sparkles',
            metric: 'Zürich Desk',
            title: 'Bespoke Concierge Care',
            description: 'From custom boot fitting advice to door-to-trailhead private transfers, your journey is curated by our Zürich team.',
          },
        ],
      },
      testimonialsSection: {
        eyebrow: 'FIELD PERSPECTIVES',
        heading: 'Reflections from Our Guests',
        subheading: 'First-hand accounts from travelers who have walked our alpine ledges, paddled Arctic waters, and shared high refuge tables.',
      },
      latestBlogsSection: {
        eyebrow: 'THE EXPEDITION JOURNAL',
        heading: 'Field Dispatches, Route Notes & Equipment Essays',
        subheading: 'Technical insights, seasonal weather analyses, and essays from our senior guides and polar naturalists.',
      },
      newsletterSection: {
        eyebrow: 'PRIVATE DISPATCHES',
        heading: 'Receive Seasonal Route Releases & Polar Ice Briefings',
        subheading: 'Issued quarterly from our Zürich desk. Early access to unreleased private departures, guide essays, and technical gear dossiers.',
        buttonLabel: 'Subscribe to Dispatches',
        disclaimer: 'Zero promotional clutter; unsubscribe in one click. Protected under Swiss privacy regulations.',
      },
    },
  })

  console.log('--- Celeste Expeditions Database Seeding Completed Successfully! ---')
  process.exit(0)
}

main().catch((err) => {
  console.error('Fatal seed script error:', err)
  process.exit(1)
})
