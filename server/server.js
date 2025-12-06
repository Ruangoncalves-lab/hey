import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { initScheduler } from './jobs/scheduler.js';

// Routes
import tenantRoutes from './routes/tenantRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// OAuth Routes (Removed Facebook OAuth routes as they are now handled by Edge Functions)
// API Routes (Removed Meta Ads API routes as they are now handled by Edge Functions)

app.use('/api/webhooks', webhookRoutes);

// Tenant Middleware validation
import { validateTenant } from './middleware/tenant.js';
app.use('/api/tenants/:tid', validateTenant, tenantRoutes);

app.get('/', (req, res) => {
    res.send('TrafficPro API (Supabase Edition) is running...');
});

// Error Handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// Start Scheduler
initScheduler();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});