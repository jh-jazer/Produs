import './env.js';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './src/config/db.js';
import { PostHog } from 'posthog-node';
import passport from 'passport';

// Config
import './src/config/passport.js';

// Routes
import authRoutes from './src/routes/authRoutes.js';
import habitRoutes from './src/routes/habitRoutes.js';
import plannerRoutes from './src/routes/plannerRoutes.js';
import financeRoutes from './src/routes/financeRoutes.js';
import feedRoutes from './src/routes/feedRoutes.js';
import challengesRoutes from './src/routes/challengesRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import journalRoutes from './src/routes/journalRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import bugRoutes from './src/routes/bugRoutes.js';
import healthRoutes from './src/routes/healthRoutes.js';

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// PostHog Analytics
let posthog = null;
if (process.env.POSTHOG_API_KEY) {
    posthog = new PostHog(process.env.POSTHOG_API_KEY, {
        host: process.env.POSTHOG_HOST || "https://app.posthog.com"
    });
}

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use(passport.initialize());

// Socket.io connection logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/challenges', challengesRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bugs', bugRoutes);
app.use('/api/health', healthRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('Produs API is running...');
});

// Status Route for Frontend Health Checks
app.get('/api/status', (req, res) => {
    res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV || 'development' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (posthog) {
        posthog.capture({
            distinctId: 'server',
            event: 'server_started',
            properties: {
                port: PORT,
                timestamp: new Date()
            }
        });
    }
});

export default app;
