const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();


const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true, trim: true },
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

const expenseSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    amount: { type: Number, required: true, min: 0 },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    splitType: { type: String, enum: ['equal', 'exact', 'percentage'], default: 'equal' },
    splits: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, amount: { type: Number, required: true, min: 0 } }],
    category: { type: String, enum: ['food', 'transport', 'accommodation', 'entertainment', 'utilities', 'shopping', 'other'], default: 'other' },
    date: { type: Date, default: Date.now },
    receipt: { type: String }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Group = mongoose.models.Group || mongoose.model('Group', groupSchema);
const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);

// ─── Seed ────────────────────────────────────────────────────────────────────

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        await Promise.all([User.deleteMany({}), Group.deleteMany({}), Expense.deleteMany({})]);
        console.log('🗑️  Cleared all collections');

        // Users
        const usersData = [
            { name: 'Saman Shakya', email: 'saman@example.com', password: 'password123', phoneNumber: '9800000001' },
            { name: 'Priya Sharma', email: 'priya@example.com', password: 'password123', phoneNumber: '9800000002' },
            { name: 'Rahul Thapa', email: 'rahul@example.com', password: 'password123', phoneNumber: '9800000003' },
            { name: 'Anita Rai', email: 'anita@example.com', password: 'password123', phoneNumber: '9800000004' },
            { name: 'Bikash Karki', email: 'bikash@example.com', password: 'password123', phoneNumber: '9800000005' },
        ];

        const users = [];
        for (const u of usersData) {
            const user = new User(u);
            await user.save();
            users.push(user);
        }
        console.log(`👥 Seeded ${users.length} users`);

        // Groups
        const groupsData = [
            { name: 'Goa Trip 2026', description: 'Friends trip to Goa in March 2026', admin: users[0]._id, members: [users[0]._id, users[1]._id, users[2]._id, users[3]._id] },
            { name: 'Flat Mates', description: 'Monthly shared apartment expenses', admin: users[1]._id, members: [users[1]._id, users[2]._id, users[4]._id] },
            { name: 'Office Lunch Group', description: 'Daily office lunch splits', admin: users[0]._id, members: [users[0]._id, users[1]._id, users[2]._id] },
            { name: 'Pokhara Weekend', description: 'Weekend trip to Pokhara', admin: users[2]._id, members: [users[0]._id, users[2]._id, users[3]._id, users[4]._id] },
        ];

        const groups = await Group.insertMany(groupsData);
        console.log(`👨‍👩‍👧‍👦 Seeded ${groups.length} groups`);

        // Expenses
        const expensesData = [
            // Goa Trip expenses
            {
                title: 'Flight Tickets',
                description: 'Round trip flights to Goa',
                amount: 24000,
                paidBy: users[0]._id,
                group: groups[0]._id,
                splitType: 'equal',
                splits: [
                    { user: users[0]._id, amount: 6000 },
                    { user: users[1]._id, amount: 6000 },
                    { user: users[2]._id, amount: 6000 },
                    { user: users[3]._id, amount: 6000 },
                ],
                category: 'transport',
                date: new Date('2026-03-01')
            },
            {
                title: 'Hotel Booking',
                description: '3 nights at Beach Resort',
                amount: 18000,
                paidBy: users[1]._id,
                group: groups[0]._id,
                splitType: 'equal',
                splits: [
                    { user: users[0]._id, amount: 4500 },
                    { user: users[1]._id, amount: 4500 },
                    { user: users[2]._id, amount: 4500 },
                    { user: users[3]._id, amount: 4500 },
                ],
                category: 'accommodation',
                date: new Date('2026-03-01')
            },
            {
                title: 'Beach Dinner',
                description: 'Seafood dinner at Baga Beach',
                amount: 6000,
                paidBy: users[2]._id,
                group: groups[0]._id,
                splitType: 'equal',
                splits: [
                    { user: users[0]._id, amount: 1500 },
                    { user: users[1]._id, amount: 1500 },
                    { user: users[2]._id, amount: 1500 },
                    { user: users[3]._id, amount: 1500 },
                ],
                category: 'food',
                date: new Date('2026-03-02')
            },
            {
                title: 'Water Sports',
                description: 'Parasailing and jet ski',
                amount: 8000,
                paidBy: users[3]._id,
                group: groups[0]._id,
                splitType: 'equal',
                splits: [
                    { user: users[0]._id, amount: 2000 },
                    { user: users[1]._id, amount: 2000 },
                    { user: users[2]._id, amount: 2000 },
                    { user: users[3]._id, amount: 2000 },
                ],
                category: 'entertainment',
                date: new Date('2026-03-03')
            },
            // Flat Mates expenses
            {
                title: 'Monthly Rent',
                description: 'March rent for the apartment',
                amount: 30000,
                paidBy: users[1]._id,
                group: groups[1]._id,
                splitType: 'equal',
                splits: [
                    { user: users[1]._id, amount: 10000 },
                    { user: users[2]._id, amount: 10000 },
                    { user: users[4]._id, amount: 10000 },
                ],
                category: 'utilities',
                date: new Date('2026-03-01')
            },
            {
                title: 'Electricity Bill',
                description: 'February electricity bill',
                amount: 3000,
                paidBy: users[2]._id,
                group: groups[1]._id,
                splitType: 'equal',
                splits: [
                    { user: users[1]._id, amount: 1000 },
                    { user: users[2]._id, amount: 1000 },
                    { user: users[4]._id, amount: 1000 },
                ],
                category: 'utilities',
                date: new Date('2026-03-05')
            },
            {
                title: 'Grocery Shopping',
                description: 'Weekly groceries from supermarket',
                amount: 4500,
                paidBy: users[4]._id,
                group: groups[1]._id,
                splitType: 'equal',
                splits: [
                    { user: users[1]._id, amount: 1500 },
                    { user: users[2]._id, amount: 1500 },
                    { user: users[4]._id, amount: 1500 },
                ],
                category: 'shopping',
                date: new Date('2026-03-07')
            },
            // Office Lunch expenses
            {
                title: 'Monday Lunch',
                description: 'Lunch at Himalayan Kitchen',
                amount: 1800,
                paidBy: users[0]._id,
                group: groups[2]._id,
                splitType: 'equal',
                splits: [
                    { user: users[0]._id, amount: 600 },
                    { user: users[1]._id, amount: 600 },
                    { user: users[2]._id, amount: 600 },
                ],
                category: 'food',
                date: new Date('2026-03-10')
            },
            {
                title: 'Wednesday Lunch',
                description: 'Lunch at Roadhouse Cafe',
                amount: 2400,
                paidBy: users[1]._id,
                group: groups[2]._id,
                splitType: 'equal',
                splits: [
                    { user: users[0]._id, amount: 800 },
                    { user: users[1]._id, amount: 800 },
                    { user: users[2]._id, amount: 800 },
                ],
                category: 'food',
                date: new Date('2026-03-12')
            },
            // Pokhara Weekend expenses
            {
                title: 'Bus Tickets',
                description: 'Tourist bus Kathmandu to Pokhara',
                amount: 6000,
                paidBy: users[2]._id,
                group: groups[3]._id,
                splitType: 'equal',
                splits: [
                    { user: users[0]._id, amount: 1500 },
                    { user: users[2]._id, amount: 1500 },
                    { user: users[3]._id, amount: 1500 },
                    { user: users[4]._id, amount: 1500 },
                ],
                category: 'transport',
                date: new Date('2026-03-08')
            },
            {
                title: 'Lakeside Hotel',
                description: '2 nights at Hotel Pokhara Grande',
                amount: 12000,
                paidBy: users[0]._id,
                group: groups[3]._id,
                splitType: 'equal',
                splits: [
                    { user: users[0]._id, amount: 3000 },
                    { user: users[2]._id, amount: 3000 },
                    { user: users[3]._id, amount: 3000 },
                    { user: users[4]._id, amount: 3000 },
                ],
                category: 'accommodation',
                date: new Date('2026-03-08')
            },
            {
                title: 'Paragliding',
                description: 'Paragliding from Sarangkot',
                amount: 14000,
                paidBy: users[3]._id,
                group: groups[3]._id,
                splitType: 'equal',
                splits: [
                    { user: users[0]._id, amount: 3500 },
                    { user: users[2]._id, amount: 3500 },
                    { user: users[3]._id, amount: 3500 },
                    { user: users[4]._id, amount: 3500 },
                ],
                category: 'entertainment',
                date: new Date('2026-03-09')
            },
        ];

        const expenses = await Expense.insertMany(expensesData);
        console.log(`💰 Seeded ${expenses.length} expenses`);

        console.log('\n🎉 Expense Splitter database seeded successfully!');
        console.log('─────────────────────────────────────────────────');
        console.log('👤 User 1: saman@example.com  / password123');
        console.log('👤 User 2: priya@example.com  / password123');
        console.log('👤 User 3: rahul@example.com  / password123');
        console.log('👤 User 4: anita@example.com  / password123');
        console.log('👤 User 5: bikash@example.com / password123');
        console.log('─────────────────────────────────────────────────');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seed();