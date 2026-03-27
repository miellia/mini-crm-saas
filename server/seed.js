require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Interaction = require('./models/Interaction');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Interaction.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@crm.com',
      password: 'admin123',
    });
    console.log('👤 Admin user created: admin@crm.com / admin123');

    // Create sample customers
    const customers = await Customer.insertMany([
      {
        name: 'Sarah Johnson',
        email: 'sarah@techcorp.com',
        phone: '+1 (555) 123-4567',
        company: 'TechCorp Inc.',
        status: 'Converted',
        tags: ['VIP', 'Enterprise'],
        notes: 'Long-term client, renewed contract in Q1.',
      },
      {
        name: 'Michael Chen',
        email: 'michael@startupai.io',
        phone: '+1 (555) 234-5678',
        company: 'StartupAI',
        status: 'Qualified',
        tags: ['Lead', 'Startup'],
        notes: 'Interested in premium plan. Follow up next week.',
      },
      {
        name: 'Emily Rodriguez',
        email: 'emily@designhub.co',
        phone: '+1 (555) 345-6789',
        company: 'DesignHub',
        status: 'Contacted',
        tags: ['Frequent'],
        notes: 'Met at design conference. Sent intro email.',
      },
      {
        name: 'David Kim',
        email: 'david@cloudscale.net',
        phone: '+1 (555) 456-7890',
        company: 'CloudScale',
        status: 'Lead',
        tags: ['Lead'],
        notes: 'Downloaded whitepaper from website.',
      },
      {
        name: 'Lisa Thompson',
        email: 'lisa@retailplus.com',
        phone: '+1 (555) 567-8901',
        company: 'RetailPlus',
        status: 'Converted',
        tags: ['VIP', 'Frequent'],
        notes: 'Upgraded to enterprise plan last month.',
      },
      {
        name: 'James Wilson',
        email: 'james@analytics.io',
        phone: '+1 (555) 678-9012',
        company: 'Analytics Pro',
        status: 'Contacted',
        tags: ['Lead'],
        notes: 'Scheduled demo for next Tuesday.',
      },
      {
        name: 'Amanda Foster',
        email: 'amanda@greentech.org',
        phone: '+1 (555) 789-0123',
        company: 'GreenTech Solutions',
        status: 'Lead',
        tags: ['Lead', 'Enterprise'],
        notes: 'Referred by Sarah Johnson.',
      },
      {
        name: 'Robert Martinez',
        email: 'robert@finserv.com',
        phone: '+1 (555) 890-1234',
        company: 'FinServ Group',
        status: 'Qualified',
        tags: ['VIP', 'Enterprise'],
        notes: 'Needs compliance features. Legal team reviewing.',
      },
      {
        name: 'Jennifer Lee',
        email: 'jennifer@mediaco.tv',
        phone: '+1 (555) 901-2345',
        company: 'MediaCo',
        status: 'Lost',
        tags: ['Frequent'],
        notes: 'Went with competitor. Re-engage in 6 months.',
      },
      {
        name: 'Chris Anderson',
        email: 'chris@logisticshub.com',
        phone: '+1 (555) 012-3456',
        company: 'LogisticsHub',
        status: 'Lead',
        tags: ['Lead'],
        notes: 'Signed up for newsletter.',
      },
    ]);
    console.log(`📦 ${customers.length} sample customers created`);

    // Create sample interactions
    const interactions = [];
    for (const customer of customers) {
      interactions.push({
        customer: customer._id,
        type: 'note',
        content: `Initial contact established with ${customer.name}.`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });

      if (['Contacted', 'Qualified', 'Converted'].includes(customer.status)) {
        interactions.push({
          customer: customer._id,
          type: 'email',
          content: `Sent product overview and pricing information to ${customer.name}.`,
          createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
        });
      }

      if (['Qualified', 'Converted'].includes(customer.status)) {
        interactions.push({
          customer: customer._id,
          type: 'meeting',
          content: `Product demo meeting with ${customer.name}. Discussed requirements and timeline.`,
          createdAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000),
        });
      }

      if (customer.status === 'Converted') {
        interactions.push({
          customer: customer._id,
          type: 'call',
          content: `Contract signed with ${customer.name}. Onboarding scheduled.`,
          createdAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000),
        });
      }
    }

    await Interaction.insertMany(interactions);
    console.log(`💬 ${interactions.length} sample interactions created`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('   Login: admin@crm.com / admin123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedDB();
