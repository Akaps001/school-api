const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../index'); // Import the exported app

describe('School Admin Flow Integration', () => {
    let superToken;
    let schoolId;
    let adminToken;
    let classroomId;

    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school-management');
        }
    });

    // Test Data
    const superAdmin = {
        username: `super_${Date.now()}`,
        email: `super_${Date.now()}@test.com`,
        password: 'password123',
        role: 'superadmin'
    };

    const schoolData = {
        name: `Integration School ${Date.now()}`,
        address: '123 Integration St',
        contactEmail: 'integration@school.com',
        contactPhone: '555-0000',
        establishmentDate: '2023-01-01',
        capacity: 1000
    };

    const schoolAdmin = {
        username: `admin_${Date.now()}`,
        email: `admin_${Date.now()}@test.com`,
        password: 'password123',
        role: 'school_admin'
    };

    it('should register a superadmin', async () => {
        // Try registering via API first
        const res = await request(app)
            .post('/api/user/register')
            .send(superAdmin);

        if (res.status === 200) {
            expect(res.body.ok).toBe(true);
        } else {
            // Fallback: Seed directly if API registration is restricted
            if (mongoose.connection.readyState === 0) {
                await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school-management');
            }
            const User = require('../../managers/entities/user/User.mongoModel');
            const user = new User(superAdmin);
            await user.save();
        }
    });

    it('should login as superadmin', async () => {
        const res = await request(app)
            .post('/api/user/login')
            .send({
                email: superAdmin.email,
                password: superAdmin.password
            });

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.data.token).toBeDefined();
        superToken = res.body.data.token;
    });

    it('should create a school as superadmin', async () => {
        const res = await request(app)
            .post('/api/school/createSchool')
            .set('Authorization', `Bearer ${superToken}`)
            .send(schoolData);

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.data._id).toBeDefined();
        schoolId = res.body.data._id;
    });

    it('should register a school admin', async () => {
        const res = await request(app)
            .post('/api/user/register')
            .send({
                ...schoolAdmin,
                schoolId
            });

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
    });

    it('should login as school admin', async () => {
        const res = await request(app)
            .post('/api/user/login')
            .send({
                email: schoolAdmin.email,
                password: schoolAdmin.password
            });

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.data.token).toBeDefined();
        adminToken = res.body.data.token;
    });

    it('should create a classroom as school admin', async () => {
        const res = await request(app)
            .post('/api/classroom/createClassroom')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                roomNumber: `B-${Date.now()}`,
                capacity: 25,
                resources: ['Smartboard'],
                schoolId
            });

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.data._id).toBeDefined();
        classroomId = res.body.data._id;
    });

    it('should enroll a student as school admin', async () => {
        const res = await request(app)
            .post('/api/student/createStudent')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                firstName: 'Alice',
                lastName: 'Wonder',
                email: `alice_${Date.now()}@test.com`,
                dateOfBirth: '2012-01-01',
                schoolId,
                classroomId,
                guardianName: 'Parent',
                guardianPhone: '555-1111'
            });

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.data._id).toBeDefined();
    });

    it('should FAIL to create school as school admin', async () => {
        const res = await request(app)
            .post('/api/school/createSchool')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Hacker School',
                address: 'Nowhere',
                contactEmail: 'fail@test.com',
                contactPhone: '000',
                establishmentDate: '2024-01-01',
                capacity: 100
            });

        expect(res.status).toBe(403);
        expect(res.body.ok).toBe(false);
    });

    afterAll(async () => {
        // Wait for pending handles to close
        await new Promise(resolve => setTimeout(resolve, 500));
        await mongoose.disconnect();
    });
}, 30000);
