require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');

async function listCourses() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sed');
        console.log('Connected to MongoDB');

        const courses = await Course.find({}).select('name slug imageUrl category description');

        console.log('\n=== COURSES IN DATABASE ===\n');
        courses.forEach((course, index) => {
            console.log(`${index + 1}. ${course.name}`);
            console.log(`   Slug: ${course.slug}`);
            console.log(`   Category: ${course.category || 'N/A'}`);
            console.log(`   Image: ${course.imageUrl || 'NO IMAGE'}`);
            console.log(`   Description: ${course.description ? course.description.substring(0, 100) + '...' : 'N/A'}`);
            console.log('');
        });

        console.log(`Total courses: ${courses.length}\n`);

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

listCourses();
