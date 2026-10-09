
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const City = require('../models/City');
const Landmark = require('../models/Landmark');
const PGListing = require('../models/PGListing');
const Review = require('../models/Review');
const Enquiry = require('../models/Enquiry');
const Wishlist = require('../models/Wishlist');
const InteractionLog = require('../models/InteractionLog');
const ModelVersion = require('../models/ModelVersion');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pg_finder_db';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await City.deleteMany({});
    await Landmark.deleteMany({});
    await PGListing.deleteMany({});
    await Review.deleteMany({});
    await Enquiry.deleteMany({});
    await Wishlist.deleteMany({});
    await InteractionLog.deleteMany({});
    await ModelVersion.deleteMany({});

    console.log('[Seed] Cleared existing database collections.');

    // 1. Create Users
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@pgfinder.com',
      mobile: '9876543210',
      password: 'admin123',
      role: 'admin'
    });

    const owner1 = await User.create({
      name: 'Ramesh Patel (Patel PG Housing)',
      email: 'owner1@pgfinder.com',
      mobile: '9825012345',
      password: 'owner123',
      role: 'pg_owner'
    });

    const owner2 = await User.create({
      name: 'Sanjay Sharma (Comfort Stay)',
      email: 'owner2@pgfinder.com',
      mobile: '9898054321',
      password: 'owner123',
      role: 'pg_owner'
    });

    const student1 = await User.create({
      name: 'Aarav Shah',
      email: 'student1@pgfinder.com',
      mobile: '9712345678',
      password: 'student123',
      role: 'student'
    });

    const pro1 = await User.create({
      name: 'Priya Verma',
      email: 'pro1@pgfinder.com',
      mobile: '9654321098',
      password: 'pro123',
      role: 'working_professional'
    });

    console.log('[Seed] Seeded Users: Admin, Owners, Student, Working Professional.');

    // 2. Create Cities (33 Districts of Gujarat & 36 Districts of Maharashtra)
    const defaultCities = require('../data/defaultCities');
    const createdCities = await City.insertMany(defaultCities);
    const cityMap = {};
    createdCities.forEach(c => {
      cityMap[c.cityName] = c._id;
    });

    const ahmedabad = { _id: cityMap['Ahmedabad'] };
    const mumbaiCity = { _id: cityMap['Mumbai City'] };
    const mumbaiSuburban = { _id: cityMap['Mumbai Suburban'] };
    const pune = { _id: cityMap['Pune'] };

    // Auto-generate default landmarks for ALL cities
    const autoLandmarks = [];
    for (const c of createdCities) {
      autoLandmarks.push({
        cityId: c._id,
        type: 'college',
        name: `${c.cityName} Government Science & Tech Institute`,
        address: `College Campus Road, ${c.cityName}, ${c.state}`,
        latitude: c.latitude + 0.008,
        longitude: c.longitude + 0.008
      });
      autoLandmarks.push({
        cityId: c._id,
        type: 'office',
        name: `${c.cityName} IT & Business Tech Park`,
        address: `Main Expressway, ${c.cityName}, ${c.state}`,
        latitude: c.latitude - 0.008,
        longitude: c.longitude - 0.008
      });
    }
    await Landmark.insertMany(autoLandmarks);
    console.log(`[Seed] Seeded ${createdCities.length} Cities across Gujarat & Maharashtra with landmarks.`);

    // Sample PG Stock photos
    const pgPhotos = [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800'
    ];

    // Build comprehensive PG Listings for EVERY single city
    const allPGs = [];

    createdCities.forEach((city, index) => {
      const isOwner1 = index % 2 === 0;
      const ownerId = isOwner1 ? owner1._id : owner2._id;

      // 1. Budget Student PG for EVERY city (Rent: ₹4,500 - ₹7,500)
      allPGs.push({
        ownerId: owner1._id,
        cityId: city._id,
        name: `${city.cityName} Scholars Budget Student PG`,
        description: `Affordable student accommodation near top colleges in ${city.cityName}. Includes high-speed Wi-Fi, 3-time meals, daily cleaning, and study room.`,
        address: `Station Road, Near College Circle, ${city.cityName}`,
        latitude: city.latitude + 0.005,
        longitude: city.longitude + 0.005,
        rent: 5500 + (index % 5) * 500,
        deposit: 5000,
        roomTypes: ['double', 'triple'],
        sharingType: 'Double / Triple Sharing',
        genderPreference: index % 3 === 0 ? 'girls' : index % 3 === 1 ? 'boys' : 'co-ed',
        acType: 'non-ac',
        parkingType: 'bike',
        foodAvailable: true,
        wifiAvailable: true,
        laundryAvailable: true,
        powerBackup: false,
        geyserAvailable: true,
        furnishingType: 'furnished',
        photos: [pgPhotos[index % pgPhotos.length], pgPhotos[(index + 1) % pgPhotos.length]],
        ratingAverage: 4.3 + (index % 6) * 0.1,
        ratingCount: 10 + index,
        availability: true,
        status: 'approved'
      });

      // 2. Executive Working Professional PG for EVERY city (Rent: ₹8,500 - ₹14,000)
      allPGs.push({
        ownerId: owner2._id,
        cityId: city._id,
        name: `${city.cityName} Executive Co-Living & Suites`,
        description: `Modern executive stay for IT professionals and corporate employees in ${city.cityName}. Features AC single/double rooms, fiber Wi-Fi, power backup, and food.`,
        address: `Tech Hub Road, Near Corporate Zone, ${city.cityName}`,
        latitude: city.latitude - 0.005,
        longitude: city.longitude - 0.005,
        rent: 9500 + (index % 4) * 1000,
        deposit: 10000,
        roomTypes: ['single', 'double'],
        sharingType: 'Single Private & Twin Sharing',
        genderPreference: 'co-ed',
        acType: 'ac',
        parkingType: 'both',
        foodAvailable: true,
        wifiAvailable: true,
        laundryAvailable: true,
        powerBackup: true,
        geyserAvailable: true,
        furnishingType: 'furnished',
        photos: [pgPhotos[(index + 2) % pgPhotos.length], pgPhotos[(index + 3) % pgPhotos.length]],
        ratingAverage: 4.6 + (index % 4) * 0.1,
        ratingCount: 15 + index,
        availability: true,
        status: 'approved'
      });

      // 3. Premium Deluxe Housing for major cities
      if (['Ahmedabad', 'Mumbai City', 'Mumbai Suburban', 'Pune', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Thane', 'Nashik', 'Nagpur'].includes(city.cityName)) {
        allPGs.push({
          ownerId,
          cityId: city._id,
          name: `${city.cityName} Luxury Comfort Residency`,
          description: `Spacious luxury PG in prime locality of ${city.cityName}. AC rooms, premium food, gym, laundry, security guard, and power backup.`,
          address: `Central Avenue, ${city.cityName}`,
          latitude: city.latitude + 0.002,
          longitude: city.longitude + 0.002,
          rent: 12000 + (index % 3) * 2000,
          deposit: 15000,
          roomTypes: ['single', 'double'],
          sharingType: 'Single / Double Studio',
          genderPreference: 'co-ed',
          acType: 'ac',
          parkingType: 'both',
          foodAvailable: true,
          wifiAvailable: true,
          laundryAvailable: true,
          powerBackup: true,
          geyserAvailable: true,
          furnishingType: 'furnished',
          photos: [pgPhotos[(index + 4) % pgPhotos.length]],
          ratingAverage: 4.8,
          ratingCount: 25 + index,
          availability: true,
          status: 'approved'
        });
      }
    });

    const insertedPGs = await PGListing.insertMany(allPGs);
    console.log(`[Seed] Seeded ${insertedPGs.length} PG listings across all ${createdCities.length} cities.`);

    // Seed Sample Reviews
    await Review.create([
      {
        pgId: insertedPGs[0]._id,
        userId: student1._id,
        rating: 5,
        comment: 'Super close to college! Food quality is excellent and Wi-Fi speed is great for online studies.'
      },
      {
        pgId: insertedPGs[1]._id,
        userId: pro1._id,
        rating: 5,
        comment: 'Very clean PG with spacious AC rooms. Quiet environment for work from home.'
      }
    ]);

    // Seed Sample Enquiries
    await Enquiry.create([
      {
        pgId: insertedPGs[0]._id,
        userId: student1._id,
        ownerId: owner1._id,
        message: 'Hi, is double sharing AC room available starting next Monday?',
        status: 'Contacted',
        replyMessage: 'Yes! We have 1 bed available. Please call us to finalize deposit.'
      },
      {
        pgId: insertedPGs[1]._id,
        userId: pro1._id,
        ownerId: owner2._id,
        message: 'Hello, I would like to schedule a visit tomorrow evening at 6 PM.',
        status: 'New'
      }
    ]);

    // Seed Interaction Logs for ML Pipeline
    const logs = [];
    const eventTypes = ['VIEW', 'CLICK', 'WISHLIST', 'ENQUIRY', 'REVIEW'];
    const sampleLandmark = await Landmark.findOne();

    for (let i = 0; i < 60; i++) {
      const randomPg = insertedPGs[Math.floor(Math.random() * insertedPGs.length)];
      const isStudent = i % 2 === 0;
      logs.push({
        userId: isStudent ? student1._id : pro1._id,
        pgId: randomPg._id,
        landmarkId: sampleLandmark ? sampleLandmark._id : null,
        eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        userRole: isStudent ? 'student' : 'working_professional'
      });
    }

    await InteractionLog.insertMany(logs);
    console.log(`[Seed] Seeded ${logs.length} Interaction Logs for ML training.`);

    // Seed Initial Model Version
    await ModelVersion.create({
      version: 'v1.0.0-coldstart',
      algorithm: 'Weighted Multi-Factor Heuristic (Cold-Start Engine)',
      sampleCount: logs.length,
      precisionAtK: 0.88,
      ndcgAtK: 0.91,
      r2Score: 0.84,
      isActive: true,
      notes: 'Initial baseline model seeded for all districts in Gujarat and Maharashtra'
    });

    console.log('====================================================');
    console.log('✅ DATABASE SEEDING COMPLETED FOR ALL CITIES!');
    console.log('====================================================');
    console.log('Seeded PGs across 69 Districts in Gujarat & Maharashtra');
    console.log('Demo Test Credentials:');
    console.log('Admin Account:        admin@pgfinder.com / admin123');
    console.log('PG Owner 1:           owner1@pgfinder.com / owner123');
    console.log('PG Owner 2:           owner2@pgfinder.com / owner123');
    console.log('Student Account:      student1@pgfinder.com / student123');
    console.log('Professional Account: pro1@pgfinder.com / pro123');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedDatabase();
