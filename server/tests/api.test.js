/**
 * tests/api.test.js
 * End-to-end test of every REST endpoint against a real MongoDB database.
 *
 * Run with:  npm test          (uses MONGO_URI from .env)
 *
 * The suite uses its own database name so it never touches your real data:
 * the value of MONGO_URI is reused but the database is suffixed with "_test".
 */

require('dotenv').config();

const http = require('http');
const mongoose = require('mongoose');

/* Point the app at a dedicated test database before anything connects */
function toTestUri(uri) {
  if (!uri) throw new Error('MONGO_URI is missing. Copy .env.example to .env first.');
  const [base, query] = uri.split('?');
  const trimmed = base.replace(/\/$/, '');
  const parts = trimmed.split('/');
  const dbName = parts.length > 3 ? parts.pop() : 'skillexchange';
  parts.push(`${dbName}_test`);
  return parts.join('/') + (query ? `?${query}` : '');
}

process.env.MONGO_URI = toTestUri(process.env.MONGO_URI);
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const app = require('../server');
const connectDB = require('../config/db');
const User = require('../models/User');
const SkillListing = require('../models/SkillListing');
const SwapRequest = require('../models/SwapRequest');

let passed = 0;
let failed = 0;

function check(name, ok, extra = '') {
  if (ok) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${name} ${extra}`);
  }
}

let BASE = '';

async function api(method, path, { token, body } = {}) {
  const headers = {};
  if (token) headers.authorization = `Bearer ${token}`;
  if (body) headers['content-type'] = 'application/json';

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

(async () => {
  await connectDB();
  await Promise.all([
    SwapRequest.deleteMany({}),
    SkillListing.deleteMany({}),
    User.deleteMany({}),
  ]);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  BASE = `http://127.0.0.1:${server.address().port}`;

  console.log('\nSkillExchange API test suite\n');

  /* ------------------------------------------------------------------ */
  console.log('-- Health & meta --');
  let r = await api('GET', '/api/health');
  check('GET /api/health returns ok', r.status === 200 && r.data.status === 'ok', `(${r.status})`);

  r = await api('GET', '/api/meta');
  check('GET /api/meta returns the option lists',
    r.status === 200 && r.data.CATEGORIES.includes('Web Dev') && r.data.INSTITUTIONS.includes('UET Peshawar'));

  /* ------------------------------------------------------------------ */
  console.log('\n-- Authentication --');

  const userA = {
    name: 'Ahmad Khan',
    email: 'ahmad.test@uetpeshawar.edu.pk',
    password: 'Password123',
    institution: 'UET Peshawar',
    contactInfo: 'WhatsApp: 0300-1234567',
    bio: 'Backend developer who wants to speak better English.',
    skillsToOffer: 'Python, Git and GitHub',
    skillsToLearn: ['Spoken English'],
  };
  const userB = {
    name: 'Hira Bibi',
    email: 'hira.test@uop.edu.pk',
    password: 'Password123',
    institution: 'University of Peshawar',
    contactInfo: 'Email: hira.test@uop.edu.pk',
    skillsToOffer: ['Spoken English'],
    skillsToLearn: ['Python'],
  };
  const userC = {
    name: 'Bilal Ahmed',
    email: 'bilal.test@icp.edu.pk',
    password: 'Password123',
    institution: 'Islamia College',
    contactInfo: 'WhatsApp: 0311-7654321',
  };

  r = await api('POST', '/api/auth/register', { body: { name: '', email: 'bad', password: '123' } });
  check('Register with invalid data -> 400 with messages',
    r.status === 400 && /Name is required/.test(r.data.message) && /valid email/.test(r.data.message),
    `(${r.status})`);

  r = await api('POST', '/api/auth/register', { body: userA });
  const tokenA = r.data && r.data.token;
  check('Register user A -> 201 with token and user', r.status === 201 && !!tokenA && r.data.user.name === 'Ahmad Khan', `(${r.status})`);
  check('Register response never contains the password', r.data && r.data.user && r.data.user.password === undefined);
  check('Comma separated skills are stored as an array',
    Array.isArray(r.data.user.skillsToOffer) && r.data.user.skillsToOffer.length === 2 && r.data.user.skillsToOffer[0] === 'Python');

  const dbUserA = await User.findOne({ email: userA.email }).select('+password');
  check('User A is stored in MongoDB', !!dbUserA);
  check('Password is stored as a bcrypt hash, not plain text',
    !!dbUserA && dbUserA.password !== userA.password && dbUserA.password.startsWith('$2'));

  r = await api('POST', '/api/auth/register', { body: userA });
  check('Duplicate email -> 409 conflict', r.status === 409 && /already exists/i.test(r.data.message), `(${r.status})`);

  r = await api('POST', '/api/auth/register', { body: userB });
  let tokenB = r.data && r.data.token;
  check('Register user B -> 201', r.status === 201 && !!tokenB, `(${r.status})`);

  r = await api('POST', '/api/auth/register', { body: userC });
  const tokenC = r.data && r.data.token;
  check('Register user C -> 201', r.status === 201 && !!tokenC, `(${r.status})`);

  r = await api('POST', '/api/auth/login', { body: { email: userB.email, password: 'WrongPassword' } });
  check('Login with a wrong password -> 401', r.status === 401 && /Invalid email or password/.test(r.data.message), `(${r.status})`);

  r = await api('POST', '/api/auth/login', { body: { email: 'nobody@example.com', password: 'Password123' } });
  check('Login with an unknown email -> same generic 401', r.status === 401 && /Invalid email or password/.test(r.data.message), `(${r.status})`);

  r = await api('POST', '/api/auth/login', { body: { email: userB.email, password: userB.password } });
  tokenB = r.data.token;
  check('Login with correct credentials -> 200 with JWT', r.status === 200 && !!tokenB && r.data.user.email === userB.email, `(${r.status})`);
  check('Login response never contains the password', r.data.user.password === undefined);

  /* ------------------------------------------------------------------ */
  console.log('\n-- Profile --');

  r = await api('GET', '/api/users/profile');
  check('GET profile without a token -> 401', r.status === 401, `(${r.status})`);

  r = await api('GET', '/api/users/profile', { token: 'not.a.real.token' });
  check('GET profile with an invalid token -> 401', r.status === 401, `(${r.status})`);

  r = await api('GET', '/api/users/profile', { token: tokenA });
  check('GET profile with a valid token -> 200', r.status === 200 && r.data.email === userA.email, `(${r.status})`);

  r = await api('PUT', '/api/users/profile', {
    token: tokenA,
    body: {
      name: 'Ahmad Khan Updated',
      bio: 'Updated bio for the automated test.',
      institution: 'IMSciences',
      contactInfo: 'WhatsApp: 0300-9999999',
      skillsToOffer: ['Python', 'MERN Stack'],
      skillsToLearn: 'Spoken English, Graphic Design',
    },
  });
  check('PUT profile updates every editable field',
    r.status === 200 &&
    r.data.name === 'Ahmad Khan Updated' &&
    r.data.institution === 'IMSciences' &&
    r.data.skillsToLearn.length === 2 &&
    r.data.password === undefined,
    `(${r.status} ${r.data && r.data.message})`);

  const reloadedA = await User.findOne({ email: userA.email });
  check('Profile change is persisted in MongoDB', reloadedA.name === 'Ahmad Khan Updated');

  r = await api('PUT', '/api/users/profile', { token: tokenA, body: { bio: 'x'.repeat(300) } });
  check('Bio longer than 250 characters -> 400', r.status === 400, `(${r.status})`);

  r = await api('PUT', '/api/users/profile', { token: tokenA, body: { institution: 'Harvard' } });
  check('Unknown institution -> 400', r.status === 400, `(${r.status})`);

  // Login still works after the profile update (password was not damaged)
  r = await api('POST', '/api/auth/login', { body: { email: userA.email, password: userA.password } });
  check('Password still valid after a profile update', r.status === 200 && !!r.data.token, `(${r.status})`);

  /* ------------------------------------------------------------------ */
  console.log('\n-- Listings --');

  const listingBody = {
    title: 'Learn Python from absolute basics',
    description: 'I can teach Python from variables and loops up to file handling and small automation scripts for beginners.',
    category: 'Programming',
    type: 'Offer',
    mode: 'Both',
  };

  r = await api('POST', '/api/listings', { body: listingBody });
  check('Create listing without a token -> 401', r.status === 401, `(${r.status})`);

  r = await api('POST', '/api/listings', { token: tokenA, body: { title: 'Hi', description: 'short', category: 'Nope', type: 'X', mode: 'Y' } });
  check('Create listing with invalid data -> 400', r.status === 400 && /Title must be/.test(r.data.message), `(${r.status})`);

  r = await api('POST', '/api/listings', { token: tokenA, body: listingBody });
  const listingId = r.data && r.data._id;
  check('Create listing -> 201 with populated owner',
    r.status === 201 && !!listingId && r.data.user.name === 'Ahmad Khan Updated' && r.data.status === 'Active',
    `(${r.status})`);
  check('Populated owner never includes the password', r.data.user.password === undefined);
  check('Populated owner does not expose contact details publicly', r.data.user.contactInfo === undefined);

  const dbListing = await SkillListing.findById(listingId);
  check('Listing is stored in MongoDB with the correct owner',
    !!dbListing && dbListing.user.toString() === reloadedA._id.toString());

  // A second listing from user B so filters have something to separate
  r = await api('POST', '/api/listings', {
    token: tokenB,
    body: {
      title: 'Spoken English conversation practice',
      description: 'Conversation practice, pronunciation correction and presentation preparation for university students.',
      category: 'Languages',
      type: 'Offer',
      mode: 'Online',
    },
  });
  const listingBId = r.data && r.data._id;
  check('User B creates a listing -> 201', r.status === 201 && !!listingBId, `(${r.status})`);

  r = await api('GET', '/api/listings');
  check('GET /api/listings is public and returns active listings',
    r.status === 200 && r.data.count >= 2 && Array.isArray(r.data.listings), `(${r.status})`);
  check('Listing owner is populated safely in the list',
    r.data.listings.every((l) => l.user && l.user.name && l.user.password === undefined));

  r = await api('GET', '/api/listings?search=python');
  check('Search finds the Python listing (case insensitive)',
    r.status === 200 && r.data.count === 1 && r.data.listings[0]._id === listingId, `(count ${r.data.count})`);

  r = await api('GET', '/api/listings?search=nothingmatchesthis');
  check('Search with no match returns an empty list', r.status === 200 && r.data.count === 0);

  r = await api('GET', '/api/listings?category=Languages');
  check('Category filter works', r.status === 200 && r.data.count === 1 && r.data.listings[0]._id === listingBId, `(count ${r.data.count})`);

  r = await api('GET', '/api/listings?type=Offer');
  check('Type filter works', r.status === 200 && r.data.count === 2, `(count ${r.data.count})`);

  r = await api('GET', '/api/listings?mode=Online');
  check('Mode filter works', r.status === 200 && r.data.count === 1, `(count ${r.data.count})`);

  r = await api('GET', '/api/listings?category=Programming&type=Offer&mode=Both&search=python');
  check('Combined filters work together', r.status === 200 && r.data.count === 1, `(count ${r.data.count})`);

  r = await api('GET', '/api/listings?category=Bogus');
  check('Invalid category filter -> 400', r.status === 400, `(${r.status})`);

  r = await api('GET', `/api/listings/${listingId}`);
  check('GET /api/listings/:id is public', r.status === 200 && r.data._id === listingId, `(${r.status})`);

  r = await api('GET', '/api/listings/64b7f9a2c1d2e3f4a5b6c7d8');
  check('GET a missing listing -> 404', r.status === 404, `(${r.status})`);

  r = await api('GET', '/api/listings/not-an-id');
  check('GET with a malformed id -> 404 (not a 500 crash)', r.status === 404, `(${r.status})`);

  r = await api('GET', '/api/listings/my', { token: tokenA });
  check('GET /api/listings/my returns only my listings',
    r.status === 200 && r.data.count === 1 && r.data.listings[0]._id === listingId, `(count ${r.data && r.data.count})`);

  /* ------------------------------------------------------------------ */
  console.log('\n-- Authorization on listings --');

  r = await api('PUT', `/api/listings/${listingId}`, { token: tokenB, body: { title: 'Hijacked title here' } });
  check('User B cannot edit user A\'s listing -> 403', r.status === 403, `(${r.status})`);

  r = await api('DELETE', `/api/listings/${listingId}`, { token: tokenB });
  check('User B cannot delete user A\'s listing -> 403', r.status === 403, `(${r.status})`);

  const stillThere = await SkillListing.findById(listingId);
  check('The listing still exists after the blocked attempts', !!stillThere);

  r = await api('PUT', `/api/listings/${listingId}`, { token: tokenA, body: { title: 'Learn Python from absolute basics (updated)', mode: 'Online' } });
  check('Owner can edit their own listing',
    r.status === 200 && r.data.title.endsWith('(updated)') && r.data.mode === 'Online', `(${r.status})`);

  r = await api('PUT', `/api/listings/${listingId}`, { token: tokenA, body: { description: 'too short' } });
  check('Edit with invalid data -> 400', r.status === 400, `(${r.status})`);

  /* ------------------------------------------------------------------ */
  console.log('\n-- Swap requests --');

  const swapBody = {
    listing: listingId,
    message: 'Hi, I would like to learn Python from you. I can help you practise conversational English in exchange.',
    preferredTime: 'Saturday 5 PM',
    meetingMode: 'In-Person',
    location: 'UET Peshawar Library',
  };

  r = await api('POST', '/api/swaps', { body: swapBody });
  check('Send a swap request without a token -> 401', r.status === 401, `(${r.status})`);

  r = await api('POST', '/api/swaps', { token: tokenA, body: swapBody });
  check('Cannot send a swap request for your own listing -> 400',
    r.status === 400 && /your own listing/.test(r.data.message), `(${r.status})`);

  r = await api('POST', '/api/swaps', { token: tokenB, body: { ...swapBody, message: 'too short' } });
  check('Swap request with a short message -> 400', r.status === 400, `(${r.status})`);

  r = await api('POST', '/api/swaps', { token: tokenB, body: { ...swapBody, meetingMode: 'In-Person', location: '' } });
  check('In-person swap without a location -> 400', r.status === 400, `(${r.status})`);

  r = await api('POST', '/api/swaps', { token: tokenB, body: swapBody });
  const swapId = r.data && r.data._id;
  check('User B sends a swap request -> 201 Pending',
    r.status === 201 && r.data.status === 'Pending' && r.data.sender.name === 'Hira Bibi', `(${r.status} ${r.data && r.data.message})`);
  check('Receiver is taken from the listing, not from the request body',
    r.data.receiver && r.data.receiver.name === 'Ahmad Khan Updated');
  check('Contact details are hidden while the request is Pending',
    r.data.receiver.contactInfo === undefined && r.data.sender.contactInfo === undefined);

  r = await api('POST', '/api/swaps', { token: tokenB, body: swapBody });
  check('A duplicate pending request is blocked -> 409',
    r.status === 409 && /already have a pending/.test(r.data.message), `(${r.status})`);

  const swapCount = await SwapRequest.countDocuments({ listing: listingId, sender: (await User.findOne({ email: userB.email }))._id });
  check('Only one swap request exists in MongoDB', swapCount === 1, `(count ${swapCount})`);

  r = await api('GET', '/api/swaps/my-requests', { token: tokenA });
  check('User A sees the request as incoming',
    r.status === 200 && r.data.incoming.length === 1 && r.data.incoming[0]._id === swapId && r.data.outgoing.length === 0,
    `(${r.status})`);

  r = await api('GET', '/api/swaps/my-requests', { token: tokenB });
  check('User B sees the request as outgoing',
    r.status === 200 && r.data.outgoing.length === 1 && r.data.incoming.length === 0, `(${r.status})`);

  r = await api('PUT', `/api/swaps/${swapId}`, { token: tokenC, body: { status: 'Accepted' } });
  check('A third user cannot accept someone else\'s request -> 403', r.status === 403, `(${r.status})`);

  r = await api('PUT', `/api/swaps/${swapId}`, { token: tokenB, body: { status: 'Accepted' } });
  check('The sender cannot accept their own request -> 403', r.status === 403, `(${r.status})`);

  r = await api('PUT', `/api/swaps/${swapId}`, { token: tokenA, body: { status: 'Maybe' } });
  check('An invalid status value -> 400', r.status === 400, `(${r.status})`);

  r = await api('PUT', `/api/swaps/${swapId}`, { token: tokenA, body: { status: 'Accepted' } });
  check('The receiver accepts the request -> Accepted', r.status === 200 && r.data.status === 'Accepted', `(${r.status})`);
  check('Contact details are revealed once the request is Accepted',
    !!r.data.sender.contactInfo && !!r.data.receiver.contactInfo);

  r = await api('GET', '/api/swaps/my-requests', { token: tokenB });
  check('The sender now sees the Accepted status', r.status === 200 && r.data.outgoing[0].status === 'Accepted');

  r = await api('PUT', `/api/swaps/${swapId}`, { token: tokenA, body: { status: 'Rejected' } });
  check('An already answered request cannot be changed again -> 400', r.status === 400, `(${r.status})`);

  // Rejection flow on user B's listing
  r = await api('POST', '/api/swaps', {
    token: tokenA,
    body: {
      listing: listingBId,
      message: 'Salam Hira, I would like to join your English conversation practice sessions.',
      preferredTime: 'Sunday 11 AM',
      meetingMode: 'Online',
    },
  });
  const swap2Id = r.data && r.data._id;
  check('User A sends a swap request to user B -> 201', r.status === 201, `(${r.status})`);

  r = await api('PUT', `/api/swaps/${swap2Id}`, { token: tokenB, body: { status: 'Rejected' } });
  check('The receiver rejects the request -> Rejected', r.status === 200 && r.data.status === 'Rejected', `(${r.status})`);

  r = await api('GET', '/api/swaps/my-requests', { token: tokenA });
  check('The sender sees the Rejected status',
    r.status === 200 && r.data.outgoing.find((s) => s._id === swap2Id).status === 'Rejected');

  // After a rejection the same request may be sent again (it is no longer pending)
  r = await api('POST', '/api/swaps', {
    token: tokenA,
    body: {
      listing: listingBId,
      message: 'Salam again Hira, would a different time slot work better for you?',
      preferredTime: 'Monday 4 PM',
      meetingMode: 'Online',
    },
  });
  check('A new request is allowed once the previous one is no longer pending', r.status === 201, `(${r.status})`);

  /* ------------------------------------------------------------------ */
  console.log('\n-- Closed listings & deletion --');

  r = await api('PUT', `/api/listings/${listingId}`, { token: tokenA, body: { status: 'Closed' } });
  check('Owner can close a listing', r.status === 200 && r.data.status === 'Closed', `(${r.status})`);

  r = await api('GET', '/api/listings');
  check('Closed listings disappear from the public list',
    r.status === 200 && !r.data.listings.some((l) => l._id === listingId));

  r = await api('POST', '/api/swaps', { token: tokenC, body: { ...swapBody, message: 'Can I also learn Python from you please?' } });
  check('A closed listing rejects new swap requests -> 400', r.status === 400, `(${r.status})`);

  r = await api('DELETE', `/api/listings/${listingId}`, { token: tokenA });
  check('Owner deletes their listing -> 200', r.status === 200, `(${r.status})`);

  r = await api('GET', `/api/listings/${listingId}`);
  check('The deleted listing is gone -> 404', r.status === 404, `(${r.status})`);

  const orphans = await SwapRequest.countDocuments({ listing: listingId });
  check('Swap requests of the deleted listing were removed too', orphans === 0, `(count ${orphans})`);

  /* ------------------------------------------------------------------ */
  console.log('\n-- Unknown routes --');

  r = await api('GET', '/api/does-not-exist');
  check('Unknown API route -> 404 JSON', r.status === 404 && !!r.data.message, `(${r.status})`);

  console.log(`\n${passed} passed, ${failed} failed\n`);

  server.close();
  await mongoose.connection.close();
  process.exit(failed === 0 ? 0 : 1);
})().catch(async (err) => {
  console.error('Test run crashed:', err);
  try {
    await mongoose.connection.close();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
