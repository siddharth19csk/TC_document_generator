import http from 'http';
import app from './index.js';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const server = app.listen(3456, '127.0.0.1', async () => {
  console.log('Test server running at http://127.0.0.1:3456');

  // Let's use Edge to capture a screenshot before and after clicking the button
  // Or test fetching
  console.log('Ready to test');
});

