import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { rateLimit } from 'express-rate-limit';
import { generateRouter } from './routes/generate.js';
import { healthRouter } from './routes/health.js';
import { validateConfig } from './validators/configValidator.js';

// Validate required environment variables at startup
validateConfig();

// Resolve __dirname for ES modules (needed by static file routes below)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for Render and Cloudflare tunnel rate limiting
app.set('trust proxy', 1);

// Security middleware - disable restrictive CSP that blocks script bundles on remote tunnels
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS - allow local and remote tunnel origins
app.use(cors({
  origin: true,
  credentials: true,
}));

// Body parsing with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: { error: 'Too many requests. Please wait a few minutes and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Routes
app.use('/api/health', healthRouter);
app.use('/api', generateRouter);

// Serve Help Documentation (PDF and DOCX)
app.get('/Help_Document.pdf', (req, res) => {
  const p1 = path.resolve(__dirname, '../client/public/Help_Document.pdf');
  const p2 = path.resolve(__dirname, '../documentation/Help_Document.pdf');
  const target = fs.existsSync(p1) ? p1 : (fs.existsSync(p2) ? p2 : null);
  if (target) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="Help_Document.pdf"');
    return res.sendFile(target);
  }
  res.status(404).json({ error: 'Help PDF not found.' });
});

app.get('/Help_Document.docx', (req, res) => {
  const p1 = path.resolve(__dirname, '../client/public/Help_Document.docx');
  const p2 = path.resolve(__dirname, '../documentation/Help_Document.docx');
  const target = fs.existsSync(p1) ? p1 : (fs.existsSync(p2) ? p2 : null);
  if (target) {
    return res.download(target, 'OneStream_Help_Document.docx');
  }
  res.status(404).json({ error: 'Help DOCX not found.' });
});

// Static frontend serving if built
const clientDist = path.resolve(__dirname, '../client/dist');

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.message);
  const status = err.status || 500;
  const message = status < 500 ? err.message : 'An internal server error occurred.';
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`Daily Document Generator server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;
