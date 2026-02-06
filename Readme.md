# Expense Splitter App

A full-stack MERN application for splitting expenses among friends and groups.

## Features

- 👥 User authentication (register/login)
- 🏷️ Create and manage groups
- 💰 Add and track expenses
- 📊 Automatic expense splitting
- 💳 Balance calculation (who owes whom)
- 🔍 Search and add members

## Tech Stack

**Frontend:**
- React + Vite
- React Router
- Axios
- React Toastify
- Lucide Icons
- TailwindCSS

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/expense-splitter
JWT_SECRET=your_super_secret_jwt_key_here
```

4. Start the server:
```bash
npm start
```

Backend runs on `http://localhost:3000`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## Usage

1. Register a new account
2. Create a group
3. Add members to your group
4. Start adding expenses
5. View balances to see who owes whom

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Groups
- `GET /api/groups` - Get all user's groups
- `POST /api/groups` - Create new group
- `GET /api/groups/:id` - Get group details
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group
- `POST /api/groups/:id/members` - Add member
- `DELETE /api/groups/:id/members/:userId` - Remove member

### Expenses
- `GET /api/expenses/group/:groupId` - Get group expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses/:id` - Get expense details
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/group/:groupId/balances` - Get balances

### Users
- `GET /api/users/search?query=` - Search users

## License

MIT

## Author

Your Name