import express from 'express';
import cors from 'cors';
import { handleBetigoloHistory } from './routes/betigolo-history';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Betigolo endpoints
app.get('/api/betigolo/history', handleBetigoloHistory);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Betigolo history endpoint: GET http://localhost:${PORT}/api/betigolo/history`);
});

export default app;
