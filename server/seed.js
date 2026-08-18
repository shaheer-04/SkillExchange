/**
 * seed.js
 * Optional development data: five Peshawar students, ten skill listings and
 * two swap requests. The application works perfectly with an empty database -
 * this only makes the app nicer to demonstrate.
 *
 * Run with:  npm run seed
 * Wipe only the seeded data and start again: npm run seed  (it clears first)
 *
 * All seeded accounts use the password:  Password123
 */

require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const SkillListing = require('./models/SkillListing');
const SwapRequest = require('./models/SwapRequest');

const PASSWORD = 'Password123';

const users = [
  {
    name: 'Ahmad Khan',
    email: 'ahmad@uetpeshawar.edu.pk',
    institution: 'UET Peshawar',
    contactInfo: 'WhatsApp: 0300-1234567',
    bio: 'Third year Computer Science student. I love backend development and I am trying to improve my spoken English.',
    skillsToOffer: ['Python', 'Git and GitHub', 'MERN Stack'],
    skillsToLearn: ['Spoken English', 'Graphic Design'],
  },
  {
    name: 'Hira Bibi',
    email: 'hira@uop.edu.pk',
    institution: 'University of Peshawar',
    contactInfo: 'Email: hira@uop.edu.pk',
    bio: 'English literature student who enjoys teaching conversational English and debating.',
    skillsToOffer: ['Spoken English', 'IELTS Preparation'],
    skillsToLearn: ['Python', 'Excel'],
  },
  {
    name: 'Bilal Ahmed',
    email: 'bilal@icp.edu.pk',
    institution: 'Islamia College',
    contactInfo: 'WhatsApp: 0311-7654321',
    bio: 'Self taught designer. I make posters and logos for university societies.',
    skillsToOffer: ['Graphic Design', 'Adobe Illustrator'],
    skillsToLearn: ['React', 'Freelancing'],
  },
  {
    name: 'Sana Gul',
    email: 'sana@imsciences.edu.pk',
    institution: 'IMSciences',
    contactInfo: 'Email: sana@imsciences.edu.pk',
    bio: 'Business analytics student. Excel and Power BI are my daily tools.',
    skillsToOffer: ['Excel', 'Power BI'],
    skillsToLearn: ['JavaScript', 'Mobile Development'],
  },
  {
    name: 'Usman Ali',
    email: 'usman@uetpeshawar.edu.pk',
    institution: 'UET Peshawar',
    contactInfo: 'WhatsApp: 0332-1122334',
    bio: 'Final year student earning through Fiverr. Happy to share how freelancing actually works.',
    skillsToOffer: ['Freelancing', 'React', 'JavaScript'],
    skillsToLearn: ['Graphic Design', 'Power BI'],
  },
];

const listings = [
  {
    owner: 'ahmad@uetpeshawar.edu.pk',
    title: 'Learn Python from absolute basics',
    description:
      'I can teach Python from variables and loops up to file handling and small automation scripts. Good for first and second year students who have never written code before.',
    category: 'Programming',
    type: 'Offer',
    mode: 'Both',
  },
  {
    owner: 'ahmad@uetpeshawar.edu.pk',
    title: 'Looking for a spoken English practice partner',
    description:
      'I can read and write English well but I freeze during presentations. Looking for someone who can practise conversation with me twice a week.',
    category: 'Languages',
    type: 'Request',
    mode: 'In-Person',
  },
  {
    owner: 'hira@uop.edu.pk',
    title: 'Spoken English and confident presentation skills',
    description:
      'Conversation practice, pronunciation correction and presentation preparation. I have helped several juniors prepare for interviews and viva sessions.',
    category: 'Languages',
    type: 'Offer',
    mode: 'Both',
  },
  {
    owner: 'hira@uop.edu.pk',
    title: 'Want to learn Excel for research data',
    description:
      'I need Excel for my research work: formulas, charts and pivot tables. Looking for someone patient who can teach the practical parts.',
    category: 'Other',
    type: 'Request',
    mode: 'Online',
  },
  {
    owner: 'bilal@icp.edu.pk',
    title: 'Poster and logo design in Illustrator',
    description:
      'I will teach you how to design society posters, event banners and simple logos using Adobe Illustrator, including layout and colour basics.',
    category: 'Graphic Design',
    type: 'Offer',
    mode: 'In-Person',
  },
  {
    owner: 'bilal@icp.edu.pk',
    title: 'Need help getting started with React',
    description:
      'I know HTML and CSS but React components and props confuse me. Looking for someone to walk me through building one small project.',
    category: 'Web Dev',
    type: 'Request',
    mode: 'Online',
  },
  {
    owner: 'sana@imsciences.edu.pk',
    title: 'Excel and Power BI for students',
    description:
      'Formulas, pivot tables, dashboards and an introduction to Power BI. Useful for business, economics and engineering students working with data.',
    category: 'Other',
    type: 'Offer',
    mode: 'Online',
  },
  {
    owner: 'sana@imsciences.edu.pk',
    title: 'Want to learn mobile app development',
    description:
      'I would like to build a simple Android application for my final year project. Any framework is fine as long as we start from the basics.',
    category: 'Mobile Dev',
    type: 'Request',
    mode: 'Both',
  },
  {
    owner: 'usman@uetpeshawar.edu.pk',
    title: 'How to start freelancing on Fiverr and Upwork',
    description:
      'Profile setup, choosing a service, writing proposals that actually get replies, and how payments reach Pakistan. Based on two years of real experience.',
    category: 'Freelancing',
    type: 'Offer',
    mode: 'Both',
  },
  {
    owner: 'usman@uetpeshawar.edu.pk',
    title: 'React and modern JavaScript study group',
    description:
      'I can teach React hooks, routing and API calls with Axios. I prefer teaching in a small group so we can build a project together.',
    category: 'Web Dev',
    type: 'Offer',
    mode: 'Online',
  },
];

async function seed() {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    SwapRequest.deleteMany({}),
    SkillListing.deleteMany({}),
    User.deleteMany({}),
  ]);

  console.log('Creating users...');
  const createdUsers = {};
  for (const u of users) {
    // create() runs the pre-save hook, so passwords are hashed properly
    const doc = await User.create({ ...u, password: PASSWORD });
    createdUsers[u.email] = doc;
  }

  console.log('Creating skill listings...');
  const createdListings = [];
  for (const l of listings) {
    const doc = await SkillListing.create({
      user: createdUsers[l.owner]._id,
      title: l.title,
      description: l.description,
      category: l.category,
      type: l.type,
      mode: l.mode,
      status: 'Active',
    });
    createdListings.push(doc);
  }

  console.log('Creating sample swap requests...');
  const pythonListing = createdListings.find((l) => l.title.includes('Python'));
  const englishListing = createdListings.find((l) => l.title.includes('Spoken English and'));

  await SwapRequest.create({
    listing: pythonListing._id,
    sender: createdUsers['hira@uop.edu.pk']._id,
    receiver: pythonListing.user,
    message:
      'Hi Ahmad, I would like to learn Python from you. In exchange I can help you practise conversational English for your presentations.',
    preferredTime: 'Saturday 5 PM',
    meetingMode: 'In-Person',
    location: 'UET Peshawar Library',
    status: 'Pending',
  });

  await SwapRequest.create({
    listing: englishListing._id,
    sender: createdUsers['sana@imsciences.edu.pk']._id,
    receiver: englishListing.user,
    message:
      'Assalam o Alaikum Hira, I want to improve my presentation skills before my final year defence. I can teach you Excel and Power BI in return.',
    preferredTime: 'Sunday 11 AM',
    meetingMode: 'Online',
    location: '',
    status: 'Accepted',
  });

  console.log('\nSeed complete.');
  console.log(`   ${users.length} users, ${listings.length} listings, 2 swap requests`);
  console.log('\nTest accounts (all use the same password):');
  users.forEach((u) => console.log(`   ${u.email.padEnd(34)} ${PASSWORD}`));
  console.log('');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error('Seeding failed:', err.message);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
