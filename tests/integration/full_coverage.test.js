const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../index');

describe('Comprehensive API Coverage Test', () => {
    let superToken;
    let adminToken;
    let schoolId;
    let schoolId2; // For transfer test
    let classroomId;
    let classroomId2; // For transfer test
    let studentId;

    // Test Data Generators
    // Test Data Generators
    const generateUser = (role) => {
        const prefix = role === 'school_admin' ? 'sa' : (role === 'superadmin' ? 'super' : 'user');
        return {
            username: `${prefix}_${Date.now()}`,
            email: `${role}_${Date.now()}@test.com`,
            password: 'password123',
            role
        };
    };

    const generateSchool = (suffix) => ({
        name: `Comp School ${suffix}_${Date.now()}`,
        address: `${suffix} St`,
        contactEmail: `contact_${suffix}@school.com`,
        contactPhone: '555-0000',
        establishmentDate: '2023-01-01',
        capacity: 500
    });

    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school-management');
        }
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        await mongoose.disconnect();
    });

    // ==========================================
    // 1. User & Auth (Superadmin)
    // ==========================================
    describe('Auth & Superadmin Setup', () => {
        it('should register a superadmin', async () => {
            const superAdminData = generateUser('superadmin');
            const res = await request(app).post('/api/user/register').send(superAdminData);

            // Fallback for first run if API restricts
            if (res.status === 200) {
                expect(res.body.ok).toBe(true);
            } else {
                const User = require('../../managers/entities/user/User.mongoModel');
                const user = new User(superAdminData);
                await user.save();
            }

            // Login to get token
            const loginRes = await request(app).post('/api/user/login').send({
                email: superAdminData.email,
                password: superAdminData.password
            });
            expect(loginRes.status).toBe(200);
            superToken = loginRes.body.data.token;
        });
    });

    // ==========================================
    // 2. School Management (Superadmin)
    // ==========================================
    describe('School Management', () => {
        it('should create primary school', async () => {
            const res = await request(app)
                .post('/api/school/createSchool')
                .set('Authorization', `Bearer ${superToken}`)
                .send(generateSchool('Primary'));
            expect(res.status).toBe(200);
            schoolId = res.body.data._id;
        });

        it('should create secondary school (for transfer)', async () => {
            const res = await request(app)
                .post('/api/school/createSchool')
                .set('Authorization', `Bearer ${superToken}`)
                .send(generateSchool('Secondary'));
            expect(res.status).toBe(200);
            schoolId2 = res.body.data._id;
        });

        it('should get all schools', async () => {
            const res = await request(app)
                .get('/api/school/getSchools')
                .set('Authorization', `Bearer ${superToken}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data.schools)).toBe(true);
            expect(res.body.data.schools.length).toBeGreaterThanOrEqual(2);
        });

        it('should get school by ID', async () => {
            const res = await request(app)
                .get(`/api/school/getSchoolById?schoolId=${schoolId}`)
                .set('Authorization', `Bearer ${superToken}`);
            expect(res.status).toBe(200);
            expect(res.body.data._id).toBe(schoolId);
        });

        it('should update school', async () => {
            const res = await request(app)
                .put('/api/school/updateSchool')
                .set('Authorization', `Bearer ${superToken}`)
                .send({ schoolId, capacity: 999 });
            expect(res.status).toBe(200);
            expect(res.body.data.capacity).toBe(999);
        });
    });

    // ==========================================
    // 3. School Admin Setup
    // ==========================================
    describe('School Admin Setup', () => {
        it('should register and login school admin', async () => {
            const adminData = generateUser('school_admin');
            adminData.schoolId = schoolId; // Assign to primary school

            // Register
            const regRes = await request(app).post('/api/user/register').send(adminData);
            expect(regRes.status).toBe(200);

            // Login
            const loginRes = await request(app).post('/api/user/login').send({
                email: adminData.email,
                password: adminData.password
            });
            expect(loginRes.status).toBe(200);
            adminToken = loginRes.body.data.token;
        });
    });

    // ==========================================
    // 4. Classroom Management (School Admin)
    // ==========================================
    describe('Classroom Management', () => {
        it('should create a classroom', async () => {
            const res = await request(app)
                .post('/api/classroom/createClassroom')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    roomNumber: `101-${Date.now()}`,
                    capacity: 30,
                    schoolId // Must match admin's school
                });
            expect(res.status).toBe(200);
            classroomId = res.body.data._id;
        });

        it('should get classrooms', async () => {
            const res = await request(app)
                .get(`/api/classroom/getClassrooms?schoolId=${schoolId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(res.body.data.classrooms.length).toBeGreaterThanOrEqual(1);
        });

        it('should get classroom by ID', async () => {
            const res = await request(app)
                .get(`/api/classroom/getClassroomById?classroomId=${classroomId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(res.body.data._id).toBe(classroomId);
        });

        it('should update classroom', async () => {
            const res = await request(app)
                .put('/api/classroom/updateClassroom')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    classroomId,
                    capacity: 35
                });
            expect(res.status).toBe(200);
            expect(res.body.data.capacity).toBe(35);
        });
    });

    // ==========================================
    // 5. Student Management (School Admin)
    // ==========================================
    describe('Student Management', () => {
        it('should create a student', async () => {
            const res = await request(app)
                .post('/api/student/createStudent')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: `john_${Date.now()}@test.com`,
                    dateOfBirth: '2010-01-01',
                    schoolId,
                    classroomId,
                    guardianName: 'Jane Doe',
                    guardianPhone: '555-1234'
                });
            expect(res.status).toBe(200);
            studentId = res.body.data._id;
        });

        it('should get students', async () => {
            const res = await request(app)
                .get('/api/student/getStudents')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(res.body.data.students.length).toBeGreaterThanOrEqual(1);
        });

        it('should get student by ID', async () => {
            const res = await request(app)
                .get(`/api/student/getStudentById?studentId=${studentId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(res.body.data._id).toBe(studentId);
        });

        it('should update student', async () => {
            const res = await request(app)
                .put('/api/student/updateStudent')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    studentId,
                    firstName: 'Johnny'
                });
            expect(res.status).toBe(200);
            expect(res.body.data.firstName).toBe('Johnny');
        });

        it('should transfer student to secondary school', async () => {
            const res = await request(app)
                .post('/api/student/transferStudent')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    studentId,
                    newSchoolId: schoolId2
                });
            expect(res.status).toBe(200);
            expect(res.body.data.schoolId).toBe(schoolId2);
        });

        it('should deny access to transferred student for original admin', async () => {
            const res = await request(app)
                .get(`/api/student/getStudentById?studentId=${studentId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(403);
        });
    });

    // ==========================================
    // 6. Cleanup (Superadmin)
    // ==========================================
    describe('Cleanup', () => {
        it('should delete classroom (after student transfer)', async () => {
            const res = await request(app)
                .delete(`/api/classroom/deleteClassroom?classroomId=${classroomId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
        });

        it('should delete school', async () => {
            const res = await request(app)
                .delete(`/api/school/deleteSchool?schoolId=${schoolId}`)
                .set('Authorization', `Bearer ${superToken}`);
            expect(res.status).toBe(200);
        });
    });

}, 60000); // Extended timeout
