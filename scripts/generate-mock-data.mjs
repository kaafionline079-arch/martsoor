/**
 * Generates realistic Martisoor mock JSON datasets.
 * Run: node scripts/generate-mock-data.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'src', 'data');

const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1000&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1000&q=80',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1000&q=80',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1000&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000&q=80',
  'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1000&q=80',
  'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1000&q=80',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1000&q=80',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000&q=80',
  'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=1000&q=80',
];

const AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
];

const FIRST_NAMES = [
  'Amina', 'Hassan', 'Layla', 'Omar', 'Nadia', 'Yusuf', 'Ayaan', 'Farah', 'Ibrahim', 'Samiya',
  'Khalid', 'Zahra', 'Mohamed', 'Hodan', 'Abdi', 'Sahra', 'Ahmed', 'Fadumo', 'Ismail', 'Hibo',
  'Daniel', 'Sofia', 'Marcus', 'Elena', 'James', 'Nora', 'Lucas', 'Maya', 'Ethan', 'Aisha',
  'Noah', 'Leila', 'Adam', 'Rania', 'Samir', 'Dina', 'Tariq', 'Yasmin', 'Bilal', 'Mariam',
];

const LAST_NAMES = [
  'Hassan', 'Ali', 'Osman', 'Mohamed', 'Abdi', 'Farah', 'Yusuf', 'Ahmed', 'Ibrahim', 'Nur',
  'Warsame', 'Jama', 'Said', 'Omar', 'Aden', 'Gedi', 'Khan', 'Rahman', 'Hussein', 'Sheikh',
  'Carter', 'Brooks', 'Nguyen', 'Patel', 'Rossi', 'Silva', 'Berg', 'Costa', 'Moreau', 'Keller',
];

const LOCATIONS = [
  'Liido Pavilion, Mogadishu',
  'The Pearl Hall',
  'Villa Gardens',
  'Harbor Rooftop',
  'Gold Room, City Center',
  'Seaside Terrace',
  'Martisoor Studio Loft',
  'Palm Court Ballroom',
  'Skyline Gallery',
  'Olive Grove Estate',
  'Coral Bay Club',
  'Midnight Conservatory',
];

const EVENT_TEMPLATES = [
  ['Harbor Evening Soirée', 'An intimate coastal gathering with live music and curated dining.', 'Soirée'],
  ['Founders Dinner', 'Private dinner for partners and early supporters.', 'Dinner'],
  ['Garden Brunch', 'Daytime celebration with botanical styling and open-air seating.', 'Brunch'],
  ['Listening Night', 'Acoustic evening with seated hospitality and signature pours.', 'Concert'],
  ['Wedding Reception', 'Warm reception with gold accents and family-style service.', 'Wedding'],
  ['Corporate Summit', 'Executive summit with keynote, breakouts, and networking.', 'Corporate'],
  ['Charity Gala', 'Black-tie fundraiser with auction and live performances.', 'Gala'],
  ['Product Launch', 'Reveal event with demos, press, and VIP lounge access.', 'Launch'],
  ['Eid Celebration', 'Festive host gathering with sweets, music, and family tables.', 'Celebration'],
  ['Art Night', 'Gallery walk with canapés and collector conversations.', 'Exhibition'],
  ['Rooftop Sunset', 'Golden-hour cocktails above the city skyline.', 'Social'],
  ['Chef Table', 'Multi-course tasting for a limited guest list.', 'Dining'],
];

const TICKET_TYPES = [
  { type: 'General', price: 65 },
  { type: 'VIP', price: 180 },
  { type: 'Founders', price: 250 },
  { type: 'Student', price: 35 },
  { type: 'Table', price: 420 },
];

const PARTNERS = [
  { recipient: 'Venue Partner', role: 'Venue' },
  { recipient: 'Catering Collective', role: 'Catering' },
  { recipient: 'Talent & Music', role: 'Entertainment' },
  { recipient: 'Floral Atelier', role: 'Decor' },
  { recipient: 'Martisoor Host Fee', role: 'Platform' },
  { recipient: 'Security Detail', role: 'Operations' },
];

const NOTES = [
  'Prefers aisle seating',
  'Plus-one confirmed',
  'Vegetarian menu',
  'Needs accessibility access',
  'VIP arrival at 18:00',
  'Photographer guest',
  undefined,
  undefined,
  undefined,
];

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seeded(20260727);

function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}

function pad(n, w = 3) {
  return String(n).padStart(w, '0');
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function isoDateTime(d) {
  return d.toISOString();
}

function addDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function randomTime() {
  const hours = [11, 12, 17, 18, 19, 20];
  const h = pick(hours);
  const m = pick(['00', '15', '30']);
  return `${String(h).padStart(2, '0')}:${m}`;
}

function ticketCode(i) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'MRT-';
  let n = i * 7919 + 17;
  for (let k = 0; k < 4; k++) {
    code += alphabet[n % alphabet.length];
    n = Math.floor(n / alphabet.length) + i + k;
  }
  return code;
}

function makeName() {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

function emailFromName(name, i) {
  const slug = name.toLowerCase().replace(/[^a-z]+/g, '.');
  return `${slug}.${i}@example.com`;
}

function phoneFromIndex(i) {
  const n = 610000000 + (i * 137) % 89999999;
  return `+252 ${String(n).slice(0, 2)} ${String(n).slice(2, 5)} ${String(n).slice(5, 9)}`;
}

// --- Events (50) ---
const today = new Date('2026-07-27T12:00:00.000Z');
const events = [];

for (let i = 1; i <= 50; i++) {
  const [baseTitle, description, category] = EVENT_TEMPLATES[(i - 1) % EVENT_TEMPLATES.length];
  const dayOffset = -150 + Math.floor(rand() * 240); // past ~5 months → future ~3 months
  const date = addDays(today, dayOffset);
  const capacity = pick([40, 60, 80, 100, 120, 150, 200, 250]);
  const budget = pick([3200, 4500, 6200, 8600, 9400, 12500, 15800, 22000]);

  let status;
  if (dayOffset < -7) status = pick(['completed', 'completed', 'completed', 'cancelled']);
  else if (dayOffset < 0) status = pick(['completed', 'live']);
  else if (dayOffset < 3) status = pick(['upcoming', 'live']);
  else if (rand() < 0.12) status = 'draft';
  else status = 'upcoming';

  const sellRate =
    status === 'draft' ? rand() * 0.05 :
    status === 'cancelled' ? rand() * 0.25 :
    status === 'completed' || status === 'live' ? 0.75 + rand() * 0.22 :
    0.35 + rand() * 0.5;

  const ticketSold = Math.min(capacity, Math.floor(capacity * sellRate));
  const guestCount = Math.min(capacity, Math.floor(ticketSold * (0.9 + rand() * 0.15)));
  const avgPrice = 65 + rand() * 120;
  const revenue = round2(ticketSold * avgPrice);

  events.push({
    id: `evt-${pad(i)}`,
    title: `${baseTitle} ${i > EVENT_TEMPLATES.length ? `#${Math.ceil(i / EVENT_TEMPLATES.length)}` : ''}`.trim(),
    description,
    date: isoDate(date),
    time: randomTime(),
    location: pick(LOCATIONS),
    coverImage: COVER_IMAGES[(i - 1) % COVER_IMAGES.length],
    status,
    guestCount,
    ticketSold,
    capacity,
    budget,
    revenue,
    category,
  });
}

// --- Guests (500) + invitations ---
const guests = [];
const invitations = [];
const channels = ['email', 'sms', 'whatsapp'];
const GUEST_CATEGORIES = [
  { id: 'vip', name: 'VIP', description: 'Priority guests and hosts of honor', color: '#C9A34E' },
  { id: 'general', name: 'General', description: 'Standard event attendees', color: '#5C6690' },
  { id: 'family', name: 'Family', description: 'Family and close relations', color: '#1F9D6A' },
  { id: 'media', name: 'Media', description: 'Press and content creators', color: '#3B6FD9' },
  { id: 'staff', name: 'Staff', description: 'Working team on site', color: '#8891B8' },
  { id: 'sponsor', name: 'Sponsor', description: 'Brand and partner guests', color: '#A8863A' },
  { id: 'speaker', name: 'Speaker', description: 'Speakers and performers', color: '#11152D' },
];

for (let i = 1; i <= 500; i++) {
  const event = events[(i - 1) % events.length];
  const name = makeName();
  const guestStatusWeights =
    event.status === 'completed' || event.status === 'live'
      ? ['checked_in', 'checked_in', 'confirmed', 'declined', 'invited']
      : event.status === 'draft'
        ? ['invited', 'invited', 'confirmed']
        : ['invited', 'confirmed', 'confirmed', 'declined', 'checked_in'];

  const status = pick(guestStatusWeights);
  const invitationStatus =
    status === 'confirmed' || status === 'checked_in' ? pick(['accepted', 'accepted', 'opened']) :
    status === 'declined' ? 'declined' :
    pick(['sent', 'delivered', 'opened', 'expired']);

  const category = pick([
    'general', 'general', 'general', 'vip', 'family', 'media', 'staff', 'sponsor', 'speaker',
  ]);

  let qrTicketStatus;
  if (status === 'declined') qrTicketStatus = pick(['none', 'revoked']);
  else if (status === 'checked_in') qrTicketStatus = 'scanned';
  else if (status === 'confirmed') qrTicketStatus = pick(['active', 'active', 'pending']);
  else if (event.status === 'completed') qrTicketStatus = pick(['expired', 'scanned', 'expired']);
  else qrTicketStatus = pick(['none', 'pending', 'pending']);

  const invitedAt = addDays(new Date(`${event.date}T12:00:00.000Z`), -pick([7, 10, 14, 21, 28]));
  const respondedAt =
    invitationStatus === 'accepted' || invitationStatus === 'declined'
      ? addDays(invitedAt, pick([1, 2, 3, 5]))
      : undefined;

  const guest = {
    id: `gst-${pad(i, 3)}`,
    name,
    email: emailFromName(name, i),
    phone: phoneFromIndex(i),
    avatar: AVATARS[(i - 1) % AVATARS.length],
    status,
    eventId: event.id,
    eventTitle: event.title,
    table: status === 'declined' ? undefined : `${pick(['A', 'B', 'C', 'D', 'VIP'])}${1 + Math.floor(rand() * 8)}`,
    notes: pick(NOTES),
    invitationStatus,
    invitedAt: isoDateTime(invitedAt),
    respondedAt: respondedAt ? isoDateTime(respondedAt) : undefined,
    category,
    qrTicketStatus,
    qrCode: qrTicketStatus === 'none' ? undefined : `QR-${pad(i, 4)}-${event.id.slice(-3).toUpperCase()}`,
  };
  guests.push(guest);

  invitations.push({
    id: `inv-${pad(i, 3)}`,
    guestId: guest.id,
    guestName: guest.name,
    eventId: event.id,
    eventTitle: event.title,
    email: guest.email,
    status: invitationStatus,
    channel: pick(channels),
    sentAt: isoDateTime(invitedAt),
    openedAt:
      ['opened', 'accepted', 'declined'].includes(invitationStatus)
        ? isoDateTime(addDays(invitedAt, 1))
        : undefined,
    respondedAt: respondedAt ? isoDateTime(respondedAt) : undefined,
  });
}

const guestCategories = GUEST_CATEGORIES.map((cat) => ({
  ...cat,
  guestCount: guests.filter((g) => g.category === cat.id).length,
}));

// Sync event guestCount from actual guests
for (const event of events) {
  const count = guests.filter((g) => g.eventId === event.id).length;
  event.guestCount = count;
}

// --- Tickets (sales) ---
const tickets = [];
let ticketIndex = 1;
for (const guest of guests) {
  if (guest.status === 'declined') continue;
  if (guest.status === 'invited' && rand() < 0.25) continue;

  const event = events.find((e) => e.id === guest.eventId);
  const ticketType = pick(TICKET_TYPES);
  let status;
  if (event.status === 'completed') status = pick(['used', 'used', 'used', 'expired', 'refunded']);
  else if (event.status === 'cancelled') status = pick(['refunded', 'expired']);
  else if (guest.status === 'checked_in') status = 'used';
  else status = 'valid';

  const purchasedAt = addDays(new Date(`${event.date}T12:00:00.000Z`), -pick([3, 5, 8, 12, 20]));

  tickets.push({
    id: `tkt-${pad(ticketIndex, 3)}`,
    code: ticketCode(ticketIndex),
    eventId: event.id,
    eventTitle: event.title,
    guestId: guest.id,
    guestName: guest.name,
    type: ticketType.type,
    price: ticketType.price,
    status,
    purchasedAt: isoDateTime(purchasedAt),
  });
  ticketIndex += 1;
}

// Additional walk-up / corporate ticket blocks per event
for (const event of events) {
  if (event.status === 'draft') continue;
  const extras = 2 + Math.floor(rand() * 6);
  for (let e = 0; e < extras; e++) {
    const ticketType = pick(TICKET_TYPES);
    const status =
      event.status === 'completed'
        ? pick(['used', 'used', 'expired'])
        : event.status === 'cancelled'
          ? 'refunded'
          : 'valid';
    tickets.push({
      id: `tkt-${pad(ticketIndex, 3)}`,
      code: ticketCode(ticketIndex),
      eventId: event.id,
      eventTitle: event.title,
      guestName: `Walk-up Guest ${ticketIndex}`,
      type: ticketType.type,
      price: ticketType.price,
      status,
      purchasedAt: isoDateTime(addDays(new Date(`${event.date}T12:00:00.000Z`), -pick([1, 2, 4]))),
    });
    ticketIndex += 1;
  }
}

// Sync ticketSold / revenue
for (const event of events) {
  const eventTickets = tickets.filter((t) => t.eventId === event.id && t.status !== 'refunded');
  event.ticketSold = eventTickets.length;
  event.revenue = round2(eventTickets.reduce((sum, t) => sum + t.price, 0));
}

// --- Attendance ---
const byEvent = events.map((event) => {
  const eg = guests.filter((g) => g.eventId === event.id);
  const invited = eg.length;
  const confirmed = eg.filter((g) => g.status === 'confirmed' || g.status === 'checked_in').length;
  const declined = eg.filter((g) => g.status === 'declined').length;
  const checkedIn = eg.filter((g) => g.status === 'checked_in').length;
  const noShow = Math.max(0, confirmed - checkedIn);
  const attendanceRate = invited === 0 ? 0 : round2((checkedIn / invited) * 100);

  return {
    eventId: event.id,
    eventTitle: event.title,
    date: event.date,
    invited,
    confirmed,
    declined,
    checkedIn,
    noShow,
    attendanceRate,
    capacity: event.capacity,
  };
});

const attendance = {
  totalInvited: guests.length,
  totalConfirmed: guests.filter((g) => g.status === 'confirmed' || g.status === 'checked_in').length,
  totalDeclined: guests.filter((g) => g.status === 'declined').length,
  totalCheckedIn: guests.filter((g) => g.status === 'checked_in').length,
  totalNoShow: byEvent.reduce((s, e) => s + e.noShow, 0),
  averageAttendanceRate: round2(
    byEvent.reduce((s, e) => s + e.attendanceRate, 0) / Math.max(byEvent.length, 1),
  ),
  byEvent,
};

// --- Invitation stats ---
const invitationStats = {
  total: invitations.length,
  byStatus: {
    draft: 0,
    sent: 0,
    delivered: 0,
    opened: 0,
    accepted: 0,
    declined: 0,
    expired: 0,
  },
  byChannel: { email: 0, sms: 0, whatsapp: 0 },
  acceptanceRate: 0,
  openRate: 0,
};

for (const inv of invitations) {
  invitationStats.byStatus[inv.status] += 1;
  invitationStats.byChannel[inv.channel] += 1;
}
invitationStats.acceptanceRate = round2(
  (invitationStats.byStatus.accepted / invitations.length) * 100,
);
invitationStats.openRate = round2(
  ((invitationStats.byStatus.opened +
    invitationStats.byStatus.accepted +
    invitationStats.byStatus.declined) /
    invitations.length) *
    100,
);

// --- Ticket sales summary ---
const byTypeMap = {};
const byStatusMap = {};
for (const t of tickets) {
  byTypeMap[t.type] ??= { type: t.type, count: 0, revenue: 0 };
  byTypeMap[t.type].count += 1;
  if (t.status !== 'refunded') byTypeMap[t.type].revenue = round2(byTypeMap[t.type].revenue + t.price);

  byStatusMap[t.status] ??= { status: t.status, count: 0 };
  byStatusMap[t.status].count += 1;
}

const ticketSales = {
  totalTickets: tickets.length,
  totalRevenue: round2(
    tickets.filter((t) => t.status !== 'refunded').reduce((s, t) => s + t.price, 0),
  ),
  byType: Object.values(byTypeMap),
  byStatus: Object.values(byStatusMap),
  byEvent: events.map((event) => {
    const et = tickets.filter((t) => t.eventId === event.id && t.status !== 'refunded');
    return {
      eventId: event.id,
      eventTitle: event.title,
      sold: et.length,
      revenue: round2(et.reduce((s, t) => s + t.price, 0)),
      capacity: event.capacity,
    };
  }),
};

// --- Transactions / payment history ---
const transactions = [];
let txn = 1;

for (const event of events) {
  const eventTickets = tickets.filter((t) => t.eventId === event.id && t.status !== 'refunded');
  const ticketRevenue = round2(eventTickets.reduce((s, t) => s + t.price, 0));

  if (ticketRevenue > 0) {
    transactions.push({
      id: `txn-${pad(txn++)}`,
      title: `Ticket sales — ${event.title}`,
      amount: ticketRevenue,
      type: 'credit',
      category: 'Tickets',
      date: isoDateTime(addDays(new Date(`${event.date}T12:00:00.000Z`), -2)),
      status:
        event.status === 'upcoming' || event.status === 'draft'
          ? pick(['completed', 'completed', 'pending'])
          : 'completed',
      eventId: event.id,
      reference: `SL-${event.id.toUpperCase()}`,
    });
  }

  if (event.status !== 'draft' && ticketRevenue > 0) {
    // Keep operating costs realistic vs ticket revenue
    const venue = round2(ticketRevenue * (0.18 + rand() * 0.1));
    transactions.push({
      id: `txn-${pad(txn++)}`,
      title: `Venue deposit — ${event.title}`,
      amount: venue,
      type: 'debit',
      category: 'Venue',
      date: isoDateTime(addDays(new Date(`${event.date}T12:00:00.000Z`), -30)),
      status: 'completed',
      eventId: event.id,
      reference: `VN-${pad(txn)}`,
    });

    if (rand() > 0.3) {
      transactions.push({
        id: `txn-${pad(txn++)}`,
        title: `Catering — ${event.title}`,
        amount: round2(ticketRevenue * (0.1 + rand() * 0.08)),
        type: 'debit',
        category: 'Catering',
        date: isoDateTime(addDays(new Date(`${event.date}T12:00:00.000Z`), -10)),
        status: pick(['completed', 'completed', 'pending']),
        eventId: event.id,
        reference: `CT-${pad(txn)}`,
      });
    }

    if (rand() > 0.5) {
      transactions.push({
        id: `txn-${pad(txn++)}`,
        title: `Decor & styling — ${event.title}`,
        amount: round2(ticketRevenue * (0.04 + rand() * 0.05)),
        type: 'debit',
        category: 'Decor',
        date: isoDateTime(addDays(new Date(`${event.date}T12:00:00.000Z`), -6)),
        status: pick(['completed', 'pending']),
        eventId: event.id,
        reference: `DC-${pad(txn)}`,
      });
    }

    if (rand() > 0.6) {
      transactions.push({
        id: `txn-${pad(txn++)}`,
        title: `Talent — ${event.title}`,
        amount: round2(ticketRevenue * (0.05 + rand() * 0.06)),
        type: 'debit',
        category: 'Entertainment',
        date: isoDateTime(addDays(new Date(`${event.date}T12:00:00.000Z`), -8)),
        status: 'completed',
        eventId: event.id,
        reference: `TL-${pad(txn)}`,
      });
    }
  }
}

// Extra refunds / platform fees (small)
for (let i = 0; i < 20; i++) {
  const guest = pick(guests);
  transactions.push({
    id: `txn-${pad(txn++)}`,
    title: `Refund — ${guest.name}`,
    amount: pick([35, 65, 95, 180]),
    type: 'debit',
    category: 'Refunds',
    date: isoDateTime(addDays(today, -Math.floor(rand() * 80))),
    status: pick(['completed', 'completed', 'pending']),
    eventId: guest.eventId,
    reference: `RF-${pad(1000 + i)}`,
  });
}

for (let i = 0; i < 8; i++) {
  transactions.push({
    id: `txn-${pad(txn++)}`,
    title: 'Platform service fee',
    amount: round2(120 + rand() * 280),
    type: 'debit',
    category: 'Fees',
    date: isoDateTime(addDays(today, -Math.floor(rand() * 60))),
    status: 'completed',
    reference: `PF-${pad(2000 + i)}`,
  });
}

transactions.sort((a, b) => (a.date < b.date ? 1 : -1));

const credits = transactions
  .filter((t) => t.type === 'credit' && t.status === 'completed')
  .reduce((s, t) => s + t.amount, 0);
const debits = transactions
  .filter((t) => t.type === 'debit' && t.status === 'completed')
  .reduce((s, t) => s + t.amount, 0);
const pendingDebits = transactions
  .filter((t) => t.type === 'debit' && t.status === 'pending')
  .reduce((s, t) => s + t.amount, 0);
const pendingCredits = transactions
  .filter((t) => t.type === 'credit' && t.status === 'pending')
  .reduce((s, t) => s + t.amount, 0);

const balance = round2(Math.max(credits - debits, credits * 0.22));
const pending = round2(pendingDebits + pendingCredits);
const available = round2(Math.max(balance * 0.82, balance - pendingDebits));

const wallet = {
  balance,
  available,
  pending,
  currency: 'USD',
  lastUpdated: isoDateTime(today),
  lifetimeRevenue: round2(credits),
  lifetimePayouts: round2(debits),
};

// --- Distributions (share of lifetime revenue) ---
const distributionPercents = [22, 16, 10, 7, 5, 4];
const distributions = PARTNERS.map((p, idx) => {
  const percent = distributionPercents[idx];
  const amount = round2(wallet.lifetimeRevenue * (percent / 100));
  return {
    id: `dst-${pad(idx + 1)}`,
    recipient: p.recipient,
    role: p.role,
    amount,
    percent,
    status: pick(['paid', 'scheduled', 'pending']),
  };
});

// --- Reports ---
const periods = [
  { id: 'rep-2026-q1', label: 'Q1 2026', from: '2026-01-01', to: '2026-03-31' },
  { id: 'rep-2026-q2', label: 'Q2 2026', from: '2026-04-01', to: '2026-06-30' },
  { id: 'rep-2026-jul', label: 'July 2026', from: '2026-07-01', to: '2026-07-31' },
  { id: 'rep-ytd', label: 'Year to date', from: '2026-01-01', to: '2026-07-27' },
];

const reportPeriods = periods.map((p) => {
  const inRange = events.filter((e) => e.date >= p.from && e.date <= p.to);
  const held = inRange.filter((e) => e.status === 'completed' || e.status === 'live');
  const guestsHosted = guests.filter(
    (g) => inRange.some((e) => e.id === g.eventId) && (g.status === 'confirmed' || g.status === 'checked_in'),
  ).length;
  const tix = tickets.filter(
    (t) => inRange.some((e) => e.id === t.eventId) && t.status !== 'refunded',
  );
  const revenue = round2(tix.reduce((s, t) => s + t.price, 0));
  const expenses = round2(
    transactions
      .filter(
        (t) =>
          t.type === 'debit' &&
          t.status === 'completed' &&
          t.date.slice(0, 10) >= p.from &&
          t.date.slice(0, 10) <= p.to,
      )
      .reduce((s, t) => s + t.amount, 0),
  );
  const attendanceSlice = byEvent.filter((e) => e.date >= p.from && e.date <= p.to);
  const attendanceRate = attendanceSlice.length
    ? round2(attendanceSlice.reduce((s, e) => s + e.attendanceRate, 0) / attendanceSlice.length)
    : 0;

  return {
    ...p,
    eventsHeld: held.length,
    guestsHosted,
    ticketsSold: tix.length,
    revenue,
    expenses,
    net: round2(revenue - expenses),
    attendanceRate,
  };
});

const topEvents = [...events]
  .filter((e) => (e.revenue ?? 0) > 0)
  .sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0))
  .slice(0, 8)
  .map((e) => {
    const att = byEvent.find((a) => a.eventId === e.id);
    return {
      eventId: e.id,
      title: e.title,
      revenue: e.revenue ?? 0,
      attendanceRate: att?.attendanceRate ?? 0,
    };
  });

const reports = {
  generatedAt: isoDateTime(today),
  periods: reportPeriods,
  topEvents,
  highlights: [
    `${events.filter((e) => e.status === 'upcoming').length} upcoming events on the calendar`,
    `${guests.length} guests across the portfolio`,
    `${ticketSales.totalTickets} tickets issued for $${ticketSales.totalRevenue.toLocaleString()}`,
    `${invitationStats.acceptanceRate}% invitation acceptance rate`,
    `Wallet available balance $${wallet.available.toLocaleString()}`,
  ],
};

// payments.json compatibility for existing screens
const payments = {
  balance: wallet.balance,
  currency: wallet.currency,
  pending: wallet.pending,
  available: wallet.available,
  distributions,
  transactions,
};

function write(name, data) {
  const file = path.join(outDir, name);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log(`Wrote ${name} (${Array.isArray(data) ? data.length + ' items' : 'object'})`);
}

const ORGANIZERS = [
  ['Martisoor Hosts', 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80'],
  ['Harbor Collective', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'],
  ['Gold Room Events', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80'],
  ['Villa Atelier', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80'],
  ['Pearl Productions', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80'],
  ['Skyline Social', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80'],
];

function listingHash(s) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

const marketplaceListings = events
  .filter((e) => e.status !== 'cancelled')
  .map((e, i) => {
    const h = listingHash(e.id);
    const [organizer, organizerAvatar] = ORGANIZERS[h % ORGANIZERS.length];
    const soldOut = e.status === 'completed';
    const remainingBase = soldOut ? 0 : Math.max(8, e.capacity - e.ticketSold);
    const includeFree =
      h % 4 === 0 || e.category === 'Celebration' || e.category === 'Exhibition';
    const vipPrice = 120 + (h % 8) * 25;
    const regularPrice = 45 + (h % 6) * 10;
    const studentPrice = includeFree ? 0 : 25 + (h % 4) * 5;
    const familyPrice = 90 + (h % 5) * 15;
    const rem = (ratio, min) =>
      soldOut ? 0 : Math.max(min, Math.round(remainingBase * ratio));

    const tiers = [
      {
        id: 'vip',
        name: 'VIP',
        pricingMode: 'paid',
        price: vipPrice,
        capacity: Math.max(10, Math.round(e.capacity * 0.12)),
        remaining: rem(0.15, 2),
        description: 'Front access, lounge, and host greeting.',
      },
      {
        id: 'regular',
        name: 'Regular',
        pricingMode: 'paid',
        price: regularPrice,
        capacity: Math.max(20, Math.round(e.capacity * 0.5)),
        remaining: rem(0.45, 5),
        description: 'General admission with full program access.',
      },
      {
        id: 'student',
        name: 'Student',
        pricingMode: studentPrice === 0 ? 'free' : 'paid',
        price: studentPrice,
        capacity: Math.max(8, Math.round(e.capacity * 0.18)),
        remaining: rem(0.2, 3),
        description:
          studentPrice === 0
            ? 'Complimentary community seats while available.'
            : 'Valid student ID required at entry.',
      },
      {
        id: 'family',
        name: 'Family',
        pricingMode: 'paid',
        price: familyPrice,
        capacity: Math.max(8, Math.round(e.capacity * 0.2)),
        remaining: rem(0.2, 2),
        description: 'Entry for up to four guests at one table.',
      },
    ];

    const remainingTickets = tiers.reduce((s, t) => s + t.remaining, 0);
    const paid = tiers.filter((t) => t.price > 0).map((t) => t.price);

    return {
      id: `mkt-${e.id.replace('evt-', '')}`,
      eventId: e.id,
      title: e.title,
      description: e.description,
      coverImage: e.coverImage,
      location: e.location,
      date: e.date,
      time: e.time,
      organizer,
      organizerAvatar,
      category: e.category || 'Event',
      status: e.status,
      startingPrice: paid.length ? Math.min(...paid) : 0,
      remainingTickets,
      featured: e.status === 'upcoming' || e.status === 'live' || i % 9 === 0,
      tiers,
    };
  });

write('events.json', events);
write('guests.json', guests);
write('guestCategories.json', guestCategories);
write('invitations.json', invitations);
write('tickets.json', tickets);
write('marketplaceListings.json', marketplaceListings);
write('attendance.json', attendance);
write('invitationStats.json', invitationStats);
write('ticketSales.json', ticketSales);
write('transactions.json', transactions);
write('wallet.json', wallet);
write('distributions.json', distributions);
write('reports.json', reports);
write('payments.json', payments);

console.log('\nMock data generation complete.');
console.log({
  events: events.length,
  guests: guests.length,
  invitations: invitations.length,
  tickets: tickets.length,
  marketplaceListings: marketplaceListings.length,
  transactions: transactions.length,
});
