const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('./models/Course');
const dns =require('dns')
const connectDB = async (secretId) => {
  try {
    let uri = process.env.MONGO_URI;
    
    if (!uri) throw new Error("Could not find MONGODB_URI in Secrets or Env.");

    dns.setServers(['8.8.8.8', '8.8.4.4']);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    
    console.log("✅ Server DB Connected via Secrets Manager");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    if (process.env.NODE_ENV === 'production') process.exit(1);
  }
};
async function testAndFixDB() {
  try {
    console.log('Connecting to MongoDB...');
    connectDB();
    console.log('✅ Connected to MongoDB');

    // Check if multi-rotor-drones course exists
    const existingCourse = await Course.findOne({ slug: 'multi-rotor-drones' });
    
    if (!existingCourse) {
      console.log('Creating multi-rotor-drones course...');
      const newCourse = new Course({
        name: 'Multi-Rotor Drones',
        slug: 'multi-rotor-drones',
        tagline: 'Master the art of flying multi-rotor aircraft',
        description: 'Comprehensive course on multi-rotor drone operations, maintenance, and applications.',
        category: 'Aviation',
        duration: '8 weeks',
        imageUrl: '/images/drone-course.jpg',
        points: [
          'Hands-on flight training',
          'Industry certification prep',
          'Maintenance and repair skills',
          'Commercial applications'
        ],
        highlights: [
          'Expert instructors',
          'State-of-the-art equipment',
          'Real-world projects',
          'Job placement assistance'
        ],
        learningObjectives: [
          'Master drone flight controls',
          'Understand aviation regulations',
          'Perform routine maintenance',
          'Apply drones in commercial settings'
        ],
        instructor: {
          name: 'John Smith',
          title: 'Senior Drone Instructor',
          imageUrl: '/images/instructor.jpg',
          bio: '15+ years of aviation experience'
        },
        pricing: {
          amount: 1299,
          currency: 'USD',
          note: 'Payment plans available',
          inclusions: ['All equipment', 'Study materials', 'Certification fee']
        },
        curriculum: [
          {
            week: 1,
            title: 'Introduction to Drones',
            topics: [
              { title: 'Drone Types and Components', videoUrl: '', content: 'Understanding different drone types' },
              { title: 'Basic Aerodynamics', videoUrl: '', content: 'Principles of flight' }
            ]
          }
        ],
        projects: [
          {
            title: 'First Flight Project',
            description: 'Complete your first solo flight',
            imageUrl: '/images/project1.jpg'
          }
        ],
        faqs: [
          {
            question: 'Do I need prior experience?',
            answer: 'No, this course is designed for beginners.'
          }
        ],
        deadlines: [
          {
            date: '2024-02-01',
            task: 'Complete Week 1 assignments'
          }
        ]
      });

      await newCourse.save();
      console.log('✅ Multi-rotor-drones course created successfully');
    } else {
      console.log('✅ Multi-rotor-drones course already exists');
    }

    // List all courses
    const courses = await Course.find({});
    console.log(`\nTotal courses in database: ${courses.length}`);
    courses.forEach(course => {
      console.log(`- ${course.name} (${course.slug})`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database test completed successfully');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    process.exit(1);
  }
}

testAndFixDB();
