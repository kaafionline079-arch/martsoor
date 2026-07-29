import { config } from 'dotenv';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Local root / server .env, plus Render Secret Files if uploaded
config({ path: join(__dirname, '../../.env') });
config({ path: join(__dirname, '../.env') });
config({ path: '/etc/secrets/.env' });
config({ path: '/etc/secrets/render.env' });
config({ path: join(process.cwd(), 'render.env') });
config({ path: join(process.cwd(), '.env') });

const DATABASE_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const PORT = Number(process.env.PORT || 3001);

if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const secret = new TextEncoder().encode(JWT_SECRET);
const app = new Hono();

app.use('*', cors({ origin: '*' }));

app.get('/health', (c) => c.json({ ok: true, service: 'martisoor-api' }));

function mapUser(row) {
  return {
    id: row.id,
    name: row.full_name,
    email: row.email,
    phone: row.phone || '',
    avatar: row.avatar || '',
    locale: row.locale || 'so',
    memberSince: row.created_at,
    address: { line1: '', city: '', country: '' },
  };
}

function mapEvent(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    date: row.event_date,
    time: row.event_time || '18:00',
    location: row.location || '',
    coverImage: row.cover_url || '',
    status: row.status || 'upcoming',
    guestCount: Number(row.guest_count || 0),
    ticketSold: Number(row.ticket_sold || 0),
    capacity: Number(row.capacity || 100),
    budget: Number(row.budget || 0),
    revenue: 0,
    category: row.event_type || 'General',
  };
}

function mapGuest(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email || '',
    phone: row.phone || '',
    avatar: '',
    status: row.status || 'invited',
    eventId: row.event_id,
    eventTitle: row.event_title || '',
    notes: row.notes || '',
    category: row.category || 'general',
    invitationStatus: row.invitation_status || 'draft',
    qrTicketStatus:
      row.ticket_status === 'used'
        ? 'scanned'
        : row.ticket_status === 'valid'
          ? 'active'
          : 'pending',
    qrCode: row.ticket_code || row.qr_payload || '',
    amount: Number(row.amount || 0),
    invitationChannel: row.invitation_channel || '',
  };
}

async function signToken(userId) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);
}

async function requireAuth(c) {
  const header = c.req.header('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return String(payload.sub);
  } catch {
    return null;
  }
}

function ticketCode() {
  const n = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, '0');
  return `MT-${n}`;
}

// ——— Auth ———
app.post('/auth/register', async (c) => {
  const body = await c.req.json();
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const phone = String(body.phone || '').trim();
  const locale = body.locale === 'en' ? 'en' : 'so';

  if (name.length < 2) return c.json({ error: 'Enter your full name.' }, 400);
  if (!email.includes('@')) return c.json({ error: 'Enter a valid email.' }, 400);
  if (password.length < 6) {
    return c.json({ error: 'Password must be at least 6 characters.' }, 400);
  }

  const existing = await sql`SELECT id FROM profiles WHERE email = ${email} LIMIT 1`;
  if (existing.length) return c.json({ error: 'Email already registered.' }, 409);

  const password_hash = await bcrypt.hash(password, 10);
  const rows = await sql`
    INSERT INTO profiles (email, full_name, phone, password_hash, locale)
    VALUES (${email}, ${name}, ${phone}, ${password_hash}, ${locale})
    RETURNING *
  `;
  const user = rows[0];
  await sql`
    INSERT INTO wallet_balances (user_id, balance)
    VALUES (${user.id}, 0)
    ON CONFLICT (user_id) DO NOTHING
  `;
  const token = await signToken(user.id);
  return c.json({ token, user: mapUser(user) }, 201);
});

app.post('/auth/login', async (c) => {
  const body = await c.req.json();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  const rows = await sql`SELECT * FROM profiles WHERE email = ${email} LIMIT 1`;
  const user = rows[0];
  if (!user) return c.json({ error: 'Invalid email or password.' }, 401);

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return c.json({ error: 'Invalid email or password.' }, 401);

  const token = await signToken(user.id);
  return c.json({ token, user: mapUser(user) });
});

app.get('/auth/me', async (c) => {
  const userId = await requireAuth(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  const rows = await sql`SELECT * FROM profiles WHERE id = ${userId} LIMIT 1`;
  if (!rows[0]) return c.json({ error: 'Unauthorized' }, 401);
  return c.json({ user: mapUser(rows[0]) });
});

app.patch('/auth/me', async (c) => {
  const userId = await requireAuth(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  const body = await c.req.json();
  const name = body.name != null ? String(body.name).trim() : null;
  const phone = body.phone != null ? String(body.phone).trim() : null;
  const locale = body.locale === 'en' || body.locale === 'so' ? body.locale : null;

  const rows = await sql`
    UPDATE profiles SET
      full_name = COALESCE(${name}, full_name),
      phone = COALESCE(${phone}, phone),
      locale = COALESCE(${locale}, locale)
    WHERE id = ${userId}
    RETURNING *
  `;
  return c.json({ user: mapUser(rows[0]) });
});

// ——— Events ———
app.get('/events', async (c) => {
  const userId = await requireAuth(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  const rows = await sql`
    SELECT e.*,
      (SELECT COUNT(*)::int FROM guests g WHERE g.event_id = e.id) AS guest_count,
      (SELECT COUNT(*)::int FROM tickets t WHERE t.event_id = e.id AND t.status IN ('valid','used')) AS ticket_sold
    FROM events e
    WHERE e.owner_id = ${userId}
    ORDER BY e.event_date DESC, e.created_at DESC
  `;
  return c.json({ events: rows.map(mapEvent) });
});

app.post('/events', async (c) => {
  const userId = await requireAuth(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  const body = await c.req.json();
  const title = String(body.title || '').trim();
  if (!title) return c.json({ error: 'Title is required.' }, 400);

  const rows = await sql`
    INSERT INTO events (
      owner_id, title, description, event_date, event_time, location,
      event_type, cover_url, status, capacity, budget
    ) VALUES (
      ${userId},
      ${title},
      ${String(body.description || '')},
      ${body.date || new Date().toISOString().slice(0, 10)},
      ${String(body.time || '18:00')},
      ${String(body.location || '')},
      ${String(body.category || body.eventType || 'General')},
      ${String(body.coverImage || '')},
      ${String(body.status || 'upcoming')},
      ${Number(body.capacity || 100)},
      ${Number(body.budget || 0)}
    )
    RETURNING *
  `;
  return c.json({ event: mapEvent({ ...rows[0], guest_count: 0, ticket_sold: 0 }) }, 201);
});

app.get('/events/:id', async (c) => {
  const userId = await requireAuth(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  const id = c.req.param('id');
  const rows = await sql`
    SELECT e.*,
      (SELECT COUNT(*)::int FROM guests g WHERE g.event_id = e.id) AS guest_count,
      (SELECT COUNT(*)::int FROM tickets t WHERE t.event_id = e.id) AS ticket_sold
    FROM events e
    WHERE e.id = ${id} AND e.owner_id = ${userId}
    LIMIT 1
  `;
  if (!rows[0]) return c.json({ error: 'Not found' }, 404);
  return c.json({ event: mapEvent(rows[0]) });
});

app.patch('/events/:id', async (c) => {
  const userId = await requireAuth(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  const id = c.req.param('id');
  const body = await c.req.json();
  const rows = await sql`
    UPDATE events SET
      title = COALESCE(${body.title ?? null}, title),
      description = COALESCE(${body.description ?? null}, description),
      event_date = COALESCE(${body.date ?? null}, event_date),
      event_time = COALESCE(${body.time ?? null}, event_time),
      location = COALESCE(${body.location ?? null}, location),
      event_type = COALESCE(${body.category ?? body.eventType ?? null}, event_type),
      cover_url = COALESCE(${body.coverImage ?? null}, cover_url),
      status = COALESCE(${body.status ?? null}, status),
      capacity = COALESCE(${body.capacity ?? null}, capacity),
      budget = COALESCE(${body.budget ?? null}, budget)
    WHERE id = ${id} AND owner_id = ${userId}
    RETURNING *
  `;
  if (!rows[0]) return c.json({ error: 'Not found' }, 404);
  return c.json({ event: mapEvent({ ...rows[0], guest_count: 0, ticket_sold: 0 }) });
});

app.delete('/events/:id', async (c) => {
  const userId = await requireAuth(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  const id = c.req.param('id');
  const rows = await sql`
    DELETE FROM events WHERE id = ${id} AND owner_id = ${userId} RETURNING id
  `;
  if (!rows[0]) return c.json({ error: 'Not found' }, 404);
  return c.json({ ok: true });
});

// ——— Guests ———
app.get('/guests', async (c) => {
  const userId = await requireAuth(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  const eventId = c.req.query('eventId');
  const rows = eventId
    ? await sql`
        SELECT g.*, e.title AS event_title, t.status AS ticket_status, t.qr_payload
        FROM guests g
        JOIN events e ON e.id = g.event_id
        LEFT JOIN tickets t ON t.guest_id = g.id
        WHERE e.owner_id = ${userId} AND g.event_id = ${eventId}
        ORDER BY g.created_at DESC
      `
    : await sql`
        SELECT g.*, e.title AS event_title, t.status AS ticket_status, t.qr_payload
        FROM guests g
        JOIN events e ON e.id = g.event_id
        LEFT JOIN tickets t ON t.guest_id = g.id
        WHERE e.owner_id = ${userId}
        ORDER BY g.created_at DESC
      `;
  return c.json({ guests: rows.map(mapGuest) });
});

app.post('/events/:id/guests', async (c) => {
  const userId = await requireAuth(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  const eventId = c.req.param('id');
  const owned = await sql`
    SELECT id, title FROM events WHERE id = ${eventId} AND owner_id = ${userId} LIMIT 1
  `;
  if (!owned[0]) return c.json({ error: 'Event not found' }, 404);

  const body = await c.req.json();
  const name = String(body.name || '').trim();
  if (!name) return c.json({ error: 'Name is required.' }, 400);
  const code = ticketCode();
  const qr = `martisoor:${code}`;

  const guests = await sql`
    INSERT INTO guests (
      event_id, name, email, phone, status, category, amount,
      invitation_status, ticket_code, notes
    ) VALUES (
      ${eventId},
      ${name},
      ${String(body.email || '')},
      ${String(body.phone || '')},
      ${String(body.status || 'invited')},
      ${String(body.category || 'general')},
      ${Number(body.amount || 0)},
      ${String(body.invitationStatus || 'draft')},
      ${code},
      ${String(body.notes || '')}
    )
    RETURNING *
  `;
  const guest = guests[0];
  await sql`
    INSERT INTO tickets (event_id, guest_id, qr_payload, status)
    VALUES (${eventId}, ${guest.id}, ${qr}, 'valid')
  `;
  return c.json({
    guest: mapGuest({
      ...guest,
      event_title: owned[0].title,
      ticket_status: 'valid',
      qr_payload: qr,
    }),
  }, 201);
});

app.patch('/guests/:id', async (c) => {
  const userId = await requireAuth(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  const id = c.req.param('id');
  const body = await c.req.json();
  const rows = await sql`
    UPDATE guests g SET
      name = COALESCE(${body.name ?? null}, g.name),
      email = COALESCE(${body.email ?? null}, g.email),
      phone = COALESCE(${body.phone ?? null}, g.phone),
      status = COALESCE(${body.status ?? null}, g.status),
      category = COALESCE(${body.category ?? null}, g.category),
      amount = COALESCE(${body.amount ?? null}, g.amount),
      notes = COALESCE(${body.notes ?? null}, g.notes),
      invitation_status = COALESCE(${body.invitationStatus ?? null}, g.invitation_status),
      invitation_channel = COALESCE(${body.invitationChannel ?? null}, g.invitation_channel)
    FROM events e
    WHERE g.id = ${id} AND g.event_id = e.id AND e.owner_id = ${userId}
    RETURNING g.*, e.title AS event_title
  `;
  if (!rows[0]) return c.json({ error: 'Not found' }, 404);
  return c.json({ guest: mapGuest(rows[0]) });
});

app.delete('/guests/:id', async (c) => {
  const userId = await requireAuth(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  const id = c.req.param('id');
  const rows = await sql`
    DELETE FROM guests g
    USING events e
    WHERE g.id = ${id} AND g.event_id = e.id AND e.owner_id = ${userId}
    RETURNING g.id
  `;
  if (!rows[0]) return c.json({ error: 'Not found' }, 404);
  return c.json({ ok: true });
});

app.post('/guests/:id/invite', async (c) => {
  const userId = await requireAuth(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  const id = c.req.param('id');
  const body = await c.req.json();
  const channel = body.channel === 'sms' ? 'sms' : 'whatsapp';
  const rows = await sql`
    UPDATE guests g SET
      invitation_channel = ${channel},
      invitation_status = 'sent',
      status = CASE WHEN g.status = 'invited' THEN 'invited' ELSE g.status END
    FROM events e
    WHERE g.id = ${id} AND g.event_id = e.id AND e.owner_id = ${userId}
    RETURNING g.*, e.title AS event_title, e.event_date, e.event_time, e.location, e.event_type
  `;
  if (!rows[0]) return c.json({ error: 'Guest lama helin.' }, 404);
  const g = rows[0];
  const channelLabel = channel === 'sms' ? 'SMS' : 'WhatsApp';
  const inviteText =
    `Asalaamu calaykum ${g.name}! Waxaad ku casuuman tahay "${g.event_title}"` +
    `${g.event_date ? ` — ${g.event_date}` : ''}` +
    `${g.event_time ? ` saacadda ${g.event_time}` : ''}` +
    `${g.location ? ` · ${g.location}` : ''}. ` +
    `Martisoor ayaa kuu soo dirtay casuumaddan. Waad mahadsantahay!`;

  return c.json({
    guest: mapGuest(g),
    channel,
    inviteText,
    message: `Casuumadda ${channelLabel} si guul leh ayaa loo diray ${g.name}.`,
  });
});

/** Send invitation to ALL guests of an event at once */
app.post('/events/:id/invite-all', async (c) => {
  const userId = await requireAuth(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  const eventId = c.req.param('id');
  const body = await c.req.json();
  const channel = body.channel === 'sms' ? 'sms' : 'whatsapp';

  const owned = await sql`
    SELECT id, title, event_date, event_time, location FROM events
    WHERE id = ${eventId} AND owner_id = ${userId} LIMIT 1
  `;
  if (!owned[0]) return c.json({ error: 'Event not found' }, 404);

  const updated = await sql`
    UPDATE guests SET
      invitation_channel = ${channel},
      invitation_status = 'sent'
    WHERE event_id = ${eventId}
    RETURNING id, name, phone
  `;

  if (!updated.length) {
    return c.json({ error: 'Guests lama helin. Marka hore ku dar.' }, 400);
  }

  const channelLabel = channel === 'sms' ? 'SMS' : 'WhatsApp';
  return c.json({
    ok: true,
    sent: updated.length,
    channel,
    message: `${updated.length} guest ayaa ${channelLabel} casuumad loogu diray si guul leh.`,
    guests: updated.map((g) => ({ id: g.id, name: g.name, phone: g.phone })),
  });
});

// ——— Tickets ———
app.get('/tickets', async (c) => {
  const userId = await requireAuth(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  const rows = await sql`
    SELECT t.*, g.name AS guest_name, g.ticket_code, e.title AS event_title, e.event_date
    FROM tickets t
    JOIN events e ON e.id = t.event_id
    JOIN guests g ON g.id = t.guest_id
    WHERE e.owner_id = ${userId}
    ORDER BY t.created_at DESC
  `;
  return c.json({
    tickets: rows.map((r) => ({
      id: r.id,
      code: r.ticket_code,
      eventId: r.event_id,
      eventTitle: r.event_title,
      eventDate: r.event_date,
      guestId: r.guest_id,
      guestName: r.guest_name,
      type: 'Regular',
      price: 0,
      status: r.status === 'used' ? 'used' : r.status === 'valid' ? 'valid' : r.status,
      purchasedAt: r.created_at,
      qrPayload: r.qr_payload,
      checkedInAt: r.checked_in_at,
    })),
  });
});

app.post('/tickets/check-in', async (c) => {
  const userId = await requireAuth(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  const body = await c.req.json();
  const code = String(body.code || body.qrPayload || '').trim();
  if (!code) return c.json({ error: 'Ticket code required.' }, 400);

  const rows = await sql`
    SELECT t.*, g.name AS guest_name, g.ticket_code, e.title AS event_title
    FROM tickets t
    JOIN events e ON e.id = t.event_id
    JOIN guests g ON g.id = t.guest_id
    WHERE e.owner_id = ${userId}
      AND (t.qr_payload = ${code} OR g.ticket_code = ${code} OR t.qr_payload = ${'martisoor:' + code})
    LIMIT 1
  `;
  const ticket = rows[0];
  if (!ticket) return c.json({ result: 'not_found', message: 'Ticket not found.' }, 404);
  if (ticket.status === 'used') {
    return c.json({
      result: 'already_used',
      message: 'Already checked in.',
      guestName: ticket.guest_name,
      ticketId: ticket.ticket_code,
      checkedInAt: ticket.checked_in_at,
    });
  }

  const updated = await sql`
    UPDATE tickets SET status = 'used', checked_in_at = now()
    WHERE id = ${ticket.id}
    RETURNING *
  `;
  await sql`
    UPDATE guests SET status = 'checked_in' WHERE id = ${ticket.guest_id}
  `;

  return c.json({
    result: 'success',
    message: 'Checked in successfully.',
    guestName: ticket.guest_name,
    ticketId: ticket.ticket_code,
    eventTitle: ticket.event_title,
    checkedInAt: updated[0].checked_in_at,
  });
});

// ——— Wallet ———
app.get('/wallet', async (c) => {
  const userId = await requireAuth(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  let bal = await sql`SELECT * FROM wallet_balances WHERE user_id = ${userId} LIMIT 1`;
  if (!bal[0]) {
    await sql`INSERT INTO wallet_balances (user_id, balance) VALUES (${userId}, 0)`;
    bal = await sql`SELECT * FROM wallet_balances WHERE user_id = ${userId} LIMIT 1`;
  }
  const dists = await sql`
    SELECT * FROM distributions WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 50
  `;
  return c.json({
    wallet: {
      balance: Number(bal[0].balance),
      currency: 'USD',
      updatedAt: bal[0].updated_at,
    },
    distributions: dists.map((d) => ({
      id: d.id,
      guestName: d.guest_name,
      amount: Number(d.amount),
      status: d.status,
      createdAt: d.created_at,
    })),
  });
});

app.get('/wallet/transactions', async (c) => {
  const userId = await requireAuth(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  const rows = await sql`
    SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 100
  `;
  return c.json({
    transactions: rows.map((t) => ({
      id: t.id,
      amount: Number(t.amount),
      type: t.type,
      note: t.note,
      createdAt: t.created_at,
    })),
  });
});

app.post('/wallet/distribute', async (c) => {
  const userId = await requireAuth(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const paid = await sql`
    SELECT g.name, g.amount
    FROM guests g
    JOIN events e ON e.id = g.event_id
    WHERE e.owner_id = ${userId} AND g.amount > 0
  `;
  const total = paid.reduce((sum, g) => sum + Number(g.amount), 0);
  if (total <= 0) return c.json({ error: 'No guest payments to distribute.' }, 400);

  await sql`
    INSERT INTO wallet_balances (user_id, balance)
    VALUES (${userId}, ${total})
    ON CONFLICT (user_id) DO UPDATE
    SET balance = wallet_balances.balance + ${total}, updated_at = now()
  `;
  await sql`
    INSERT INTO transactions (user_id, amount, type, note)
    VALUES (${userId}, ${total}, 'credit', 'Guest payment distribution')
  `;

  for (const g of paid) {
    await sql`
      INSERT INTO distributions (user_id, guest_name, amount, status)
      VALUES (${userId}, ${g.name}, ${Number(g.amount)}, 'pending')
    `;
  }

  const bal = await sql`SELECT * FROM wallet_balances WHERE user_id = ${userId} LIMIT 1`;
  return c.json({
    ok: true,
    message: 'Lacagaha guests-ka waa la soo geliyay wallet-kaaga.',
    wallet: { balance: Number(bal[0].balance), currency: 'USD' },
    distributed: total,
  });
});

async function ensureWallet(userId) {
  let bal = await sql`SELECT * FROM wallet_balances WHERE user_id = ${userId} LIMIT 1`;
  if (!bal[0]) {
    await sql`INSERT INTO wallet_balances (user_id, balance) VALUES (${userId}, 0)`;
    bal = await sql`SELECT * FROM wallet_balances WHERE user_id = ${userId} LIMIT 1`;
  }
  return bal[0];
}

async function creditWallet(userId, amount, note) {
  await sql`
    INSERT INTO wallet_balances (user_id, balance)
    VALUES (${userId}, ${amount})
    ON CONFLICT (user_id) DO UPDATE
    SET balance = wallet_balances.balance + ${amount}, updated_at = now()
  `;
  await sql`
    INSERT INTO transactions (user_id, amount, type, note)
    VALUES (${userId}, ${amount}, 'credit', ${note})
  `;
  return ensureWallet(userId);
}

async function debitWallet(userId, amount, note) {
  const bal = await ensureWallet(userId);
  const current = Number(bal.balance);
  if (current < amount) {
    return { ok: false, error: 'Lacag kugu filan ma jirto wallet-kaaga.', balance: current };
  }
  await sql`
    UPDATE wallet_balances
    SET balance = balance - ${amount}, updated_at = now()
    WHERE user_id = ${userId}
  `;
  await sql`
    INSERT INTO transactions (user_id, amount, type, note)
    VALUES (${userId}, ${amount}, 'debit', ${note})
  `;
  const next = await ensureWallet(userId);
  return { ok: true, balance: Number(next.balance) };
}

/** Connect Salaam Bank or Merchant Account — grants starter balance once */
app.post('/wallet/connect', async (c) => {
  const userId = await requireAuth(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  const body = await c.req.json();
  const provider = body.provider === 'merchant' ? 'merchant' : 'salaam';
  const accountNumber = String(body.accountNumber || '').trim();
  if (accountNumber.length < 6) {
    return c.json({ error: 'Geli number account sax ah (ugu yaraan 6 digit).' }, 400);
  }

  await sql`
    CREATE TABLE IF NOT EXISTS payment_accounts (
      user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
      provider TEXT NOT NULL,
      account_number TEXT NOT NULL,
      connected_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  const existing = await sql`
    SELECT * FROM payment_accounts WHERE user_id = ${userId} LIMIT 1
  `;
  const grant = 250;
  let granted = 0;

  if (!existing[0]) {
    await sql`
      INSERT INTO payment_accounts (user_id, provider, account_number)
      VALUES (${userId}, ${provider}, ${accountNumber})
    `;
    await creditWallet(
      userId,
      grant,
      provider === 'salaam'
        ? 'Salaam Bank connected — starter balance'
        : 'Merchant Account connected — starter balance',
    );
    granted = grant;
  } else {
    await sql`
      UPDATE payment_accounts
      SET provider = ${provider}, account_number = ${accountNumber}, connected_at = now()
      WHERE user_id = ${userId}
    `;
  }

  const bal = await ensureWallet(userId);
  const account = (
    await sql`SELECT * FROM payment_accounts WHERE user_id = ${userId} LIMIT 1`
  )[0];

  return c.json({
    ok: true,
    message:
      granted > 0
        ? `Account waa la xiray si guul leh! $${granted} ayaa lagu daray balance-kaaga.`
        : 'Account waa la cusbooneysiiyay si guul leh.',
    granted,
    account: {
      provider: account.provider,
      accountNumber: account.account_number,
      connectedAt: account.connected_at,
    },
    wallet: { balance: Number(bal.balance), currency: 'USD' },
  });
});

app.get('/wallet/account', async (c) => {
  const userId = await requireAuth(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const rows = await sql`
      SELECT * FROM payment_accounts WHERE user_id = ${userId} LIMIT 1
    `;
    if (!rows[0]) return c.json({ connected: false, account: null });
    return c.json({
      connected: true,
      account: {
        provider: rows[0].provider,
        accountNumber: rows[0].account_number,
        connectedAt: rows[0].connected_at,
      },
    });
  } catch {
    return c.json({ connected: false, account: null });
  }
});

/** Debit wallet for ticket purchase or payout */
app.post('/wallet/debit', async (c) => {
  const userId = await requireAuth(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  const body = await c.req.json();
  const amount = Number(body.amount || 0);
  const note = String(body.note || 'Wallet debit');
  if (!(amount > 0)) return c.json({ error: 'Amount must be greater than 0.' }, 400);

  const result = await debitWallet(userId, amount, note);
  if (!result.ok) return c.json({ error: result.error, balance: result.balance }, 400);
  return c.json({
    ok: true,
    message: 'Lacagta waa laga jaray balance-kaaga.',
    wallet: { balance: result.balance, currency: 'USD' },
  });
});

/** Refund after a failed payment (credits back) */
app.post('/wallet/refund', async (c) => {
  const userId = await requireAuth(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  const body = await c.req.json();
  const amount = Number(body.amount || 0);
  const note = String(body.note || 'Payment refund');
  if (!(amount > 0)) return c.json({ error: 'Amount must be greater than 0.' }, 400);

  const bal = await creditWallet(userId, amount, note);
  return c.json({
    ok: true,
    message: 'Lacagta waa laguu soo celiyay balance-kaaga.',
    wallet: { balance: Number(bal.balance), currency: 'USD' },
  });
});

/**
 * Confirm a distribution payout:
 * - Debits wallet
 * - On forceFail: refunds immediately and returns failed
 * - Marks distribution as sent on success
 */
app.post('/wallet/payout', async (c) => {
  const userId = await requireAuth(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  const body = await c.req.json();
  const distributionId = String(body.distributionId || '');
  const forceFail = Boolean(body.forceFail);

  const rows = await sql`
    SELECT * FROM distributions
    WHERE id = ${distributionId} AND user_id = ${userId}
    LIMIT 1
  `;
  const dist = rows[0];
  if (!dist) return c.json({ error: 'Distribution lama helin.' }, 404);
  if (dist.status === 'sent') {
    return c.json({ error: 'Lacagtan hore ayaa loo diray.' }, 400);
  }

  const amount = Number(dist.amount);
  const debited = await debitWallet(
    userId,
    amount,
    `Payout to ${dist.guest_name}`,
  );
  if (!debited.ok) {
    return c.json(
      {
        ok: false,
        status: 'failed',
        error: debited.error,
        message: debited.error,
        wallet: { balance: debited.balance, currency: 'USD' },
      },
      400,
    );
  }

  if (forceFail) {
    await creditWallet(userId, amount, `Refund — payout failed (${dist.guest_name})`);
    const bal = await ensureWallet(userId);
    return c.json({
      ok: false,
      status: 'failed',
      message: 'Payment wuu fashilmay. Balance-kaaga waa laguu soo celiyay.',
      failureReason: 'Network / bank rejection (simulated)',
      wallet: { balance: Number(bal.balance), currency: 'USD' },
      attempt: {
        distributionId: dist.id,
        recipient: dist.guest_name,
        amount,
        reference: `PAY-FAIL-${Date.now().toString().slice(-8)}`,
      },
    });
  }

  await sql`
    UPDATE distributions SET status = 'sent' WHERE id = ${dist.id}
  `;
  const bal = await ensureWallet(userId);
  return c.json({
    ok: true,
    status: 'success',
    message: `$${amount.toFixed(2)} ayaa si guul leh loogu diray ${dist.guest_name}.`,
    wallet: { balance: Number(bal.balance), currency: 'USD' },
    attempt: {
      distributionId: dist.id,
      recipient: dist.guest_name,
      amount,
      reference: `PAY-${Date.now().toString().slice(-8)}`,
    },
  });
});

/** Ticket purchase — debit if paid; free is no charge */
app.post('/wallet/purchase-ticket', async (c) => {
  const userId = await requireAuth(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  const body = await c.req.json();
  const amount = Number(body.amount || 0);
  const eventTitle = String(body.eventTitle || 'Ticket');
  const forceFail = Boolean(body.forceFail);

  if (amount <= 0) {
    return c.json({
      ok: true,
      status: 'success',
      free: true,
      message: 'Ticket-ka bilaashka ah waa la helay. Ku raaxayso event-ka!',
      wallet: { balance: Number((await ensureWallet(userId)).balance), currency: 'USD' },
    });
  }

  const debited = await debitWallet(userId, amount, `Ticket: ${eventTitle}`);
  if (!debited.ok) {
    return c.json(
      {
        ok: false,
        status: 'failed',
        error: debited.error,
        message: debited.error,
        wallet: { balance: debited.balance, currency: 'USD' },
      },
      400,
    );
  }

  if (forceFail) {
    await creditWallet(userId, amount, `Refund — ticket purchase failed (${eventTitle})`);
    const bal = await ensureWallet(userId);
    return c.json({
      ok: false,
      status: 'failed',
      message: 'Iibsashada ticket-ka way fashilantay. Lacagta waa laguu soo celiyay.',
      wallet: { balance: Number(bal.balance), currency: 'USD' },
    });
  }

  return c.json({
    ok: true,
    status: 'success',
    free: false,
    message: `Ticket waa la iibsaday! $${amount.toFixed(2)} ayaa laga jaray balance-kaaga.`,
    wallet: { balance: debited.balance, currency: 'USD' },
  });
});

/**
 * Pay all guests for an event using each guest's amount (set by host).
 * Debits wallet once for the total.
 */
app.post('/wallet/pay-guests', async (c) => {
  const userId = await requireAuth(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  const body = await c.req.json();
  const eventId = String(body.eventId || '');
  const overrides = Array.isArray(body.payments) ? body.payments : null;

  const owned = await sql`
    SELECT id, title FROM events WHERE id = ${eventId} AND owner_id = ${userId} LIMIT 1
  `;
  if (!owned[0]) return c.json({ error: 'Event not found' }, 404);

  if (overrides?.length) {
    for (const row of overrides) {
      const gid = String(row.guestId || '');
      const amt = Number(row.amount || 0);
      if (!gid || !(amt >= 0)) continue;
      await sql`
        UPDATE guests g SET amount = ${amt}
        FROM events e
        WHERE g.id = ${gid} AND g.event_id = e.id AND e.owner_id = ${userId}
          AND g.event_id = ${eventId}
      `;
    }
  }

  const guests = await sql`
    SELECT id, name, amount FROM guests
    WHERE event_id = ${eventId} AND amount > 0
  `;
  if (!guests.length) {
    return c.json(
      { error: 'Fadlan u qor lacagta qof walba ka hor intaadan dirin.' },
      400,
    );
  }

  const total = guests.reduce((sum, g) => sum + Number(g.amount), 0);
  const debited = await debitWallet(
    userId,
    total,
    `Guest payouts — ${owned[0].title}`,
  );
  if (!debited.ok) {
    return c.json(
      {
        ok: false,
        error: debited.error,
        message: debited.error,
        wallet: { balance: debited.balance, currency: 'USD' },
      },
      400,
    );
  }

  for (const g of guests) {
    await sql`
      INSERT INTO distributions (user_id, guest_name, amount, status)
      VALUES (${userId}, ${g.name}, ${Number(g.amount)}, 'sent')
    `;
  }

  return c.json({
    ok: true,
    paid: guests.length,
    total,
    message: `${guests.length} qof ayaa lacag loo diray ($${total.toFixed(2)}). Balance-kaaga waa la cusbooneysiiyay.`,
    wallet: { balance: debited.balance, currency: 'USD' },
  });
});

console.log(`Martisoor API listening on http://0.0.0.0:${PORT}`);
serve({ fetch: app.fetch, port: PORT, hostname: '0.0.0.0' });
