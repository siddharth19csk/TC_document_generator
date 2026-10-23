import axios from 'axios';

const API_BASE = '/api';

export async function generateTestcasesDocument(formData, onProgress) {
  onProgress?.('Sending request to server...');

  const response = await axios.post(`${API_BASE}/generate-testcases`, formData, {
    responseType: 'blob',
    timeout: 120000, // 2 minute timeout for AI processing
    headers: { 'Content-Type': 'application/json' },
    onDownloadProgress: (e) => {
      if (e.loaded > 0) onProgress?.('Receiving document...');
    },
  });

  // Extract filename from Content-Disposition header
  const disposition = response.headers['content-disposition'] || '';
  const xFilename = response.headers['x-document-filename'];
  let filename = xFilename || 'Testcase-Document.docx';

  const match = disposition.match(/filename="?([^"]+)"?/);
  if (match) filename = match[1];

  return { blob: response.data, filename };
}

export async function checkHealth() {
  const response = await axios.get(`${API_BASE}/health`, { timeout: 5000 });
  return response.data;
}
