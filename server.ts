import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Serve static assets from dist directory
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Basic health check for Cloud Run / deployment probes
app.get('/healthz', (_req, res) => {
  res.status(200).send('OK');
});

// SPA fallback to index.html for all other GET routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SINERGI BALLPRESS server running on port ${PORT}`);
});
