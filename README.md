# Daily Document Generator

An AI-powered web application that generates structured software test cases from daily team updates, populates a supplied Word (.docx) template, and provides a downloadable document.

## Architecture

```
daily-document-generator/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx             # Main application component
│   │   ├── main.jsx            # React entry point
│   │   ├── index.css           # Global styles
│   │   └── services/
│   │       └── apiService.js   # Axios API calls
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                     # Express backend
│   ├── index.js                # Server entry point
│   ├── routes/
│   │   ├── health.js           # GET /api/health
│   │   └── generate.js         # POST /api/generate-testcases
│   ├── services/
│   │   ├── aiService.js        # Google Gemini integration
│   │   └── documentService.js  # DOCX generation via docxtemplater
│   ├── validators/
│   │   ├── inputValidator.js   # Zod form validation
│   │   ├── aiResponseValidator.js  # Zod AI response validation
│   │   └── configValidator.js  # Startup config check
│   ├── server.test.js          # Vitest unit tests
│   └── package.json
├── templates/
│   └── Testcase_Generation_Template.docx  # Your supplied Word template
├── .env.example
├── .gitignore
└── README.md
```

## Prerequisites

- **Node.js** v18 or later — Download from https://nodejs.org/
- **npm** v8 or later (included with Node.js)
- **Google Gemini API Key** — Get one free at https://aistudio.google.com/app/apikey

## Setup Instructions

### Step 1: Install Node.js

Download and install Node.js v18+ from https://nodejs.org/

Verify installation:
```powershell
node --version
npm --version
```

### Step 2: Configure Environment Variables

```powershell
cd daily-document-generator\server
copy ..\..\.env.example .env
```

Edit `server\.env` and add your Gemini API key:
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

> **Security**: Never commit your `.env` file. It is excluded by `.gitignore`.

### Step 3: Get a Gemini API Key

1. Visit https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click **Create API Key**
4. Copy the key and paste it as `GEMINI_API_KEY` in your `.env` file

### Step 4: Place the Word Template

The template must be at:
```
daily-document-generator\templates\Testcase_Generation_Template.docx
```
The template is already included in this project. If you replace it, ensure it uses the same placeholder names (see below).

### Step 5: Install Dependencies

```powershell
# Install server dependencies
cd daily-document-generator\server
npm install

# Install client dependencies
cd ..\client
npm install
```

### Step 6: Run the Application

**Terminal 1 — Start the backend:**
```powershell
cd daily-document-generator\server
npm run dev
```
Server starts at: http://localhost:3000

**Terminal 2 — Start the frontend:**
```powershell
cd daily-document-generator\client
npm run dev
```
Frontend starts at: http://localhost:5173

Open http://localhost:5173 in your browser.

## AI Model Configuration

| Variable | Default | Description |
|---|---|---|
| `GEMINI_MODEL` | `gemini-1.5-flash` | Gemini model name. Options: `gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-2.0-flash-exp` |

The application uses `gemini-1.5-flash` by default, which is fast, free-tier compatible, and capable of handling complex test case generation.

## Word Template Placeholders

The supplied template uses these placeholders (docxtemplater syntax):

| Placeholder | Source |
|---|---|
| `{reportCode}` | Form input |
| `{ticketNumber}` | Form input |
| `{projectModule}` | Form input |
| `{generatedDate}` | Auto-generated |
| `{preparedBy}` | Form input |
| `{documentVersion}` | Fixed: 1.0 |
| `{summary}` | Truncated updates |
| `{aiModel}` | From config |
| `{objective}` | AI generated |
| `{scopeAndAssumptions}` | AI generated |
| `{#testCases}...{/testCases}` | AI generated loop |
| `{tcId}` | In loop |
| `{scenario}` | In loop |
| `{preconditions}` | In loop |
| `{steps}` | In loop |
| `{testData}` | In loop |
| `{expectedResult}` | In loop |
| `{priority}` | In loop |
| `{executionNotes}` | AI generated |
| `{reviewedBy}` | Empty (for manual fill) |
| `{reviewDate}` | Empty (for manual fill) |
| `{approvalStatus}` | Fixed: Pending Review |

## Running Tests

```powershell
cd daily-document-generator\server
npm test
```

Tests cover:
- Form input validation (required fields, size limits)
- AI response structure validation
- Missing API key handling
- Invalid priority rejection

## API Endpoints

### `GET /api/health`
Returns server health status and configuration.

### `POST /api/generate-testcases`
Accepts form data, calls Gemini AI, generates and returns a `.docx` file.

**Request body:**
```json
{
  "reportCode": "R117",
  "ticketNumber": "CHG0057554",
  "projectModule": "User Authentication",
  "preparedBy": "John Smith",
  "updates": "Daily team updates and requirements...",
  "additionalContext": "Additional context..."
}
```

**Response:** `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

## Troubleshooting

| Problem | Solution |
|---|---|
| `GEMINI_API_KEY is not set` | Copy `.env.example` to `server/.env` and add your key |
| Template not found | Ensure `templates/Testcase_Generation_Template.docx` exists |
| Port already in use | Change `PORT` in `.env` or kill the process on that port |
| AI quota exceeded | Wait a minute and retry, or upgrade your Gemini plan |
| Download fails | Check browser popup/download settings |

## Oracle Cloud Infrastructure Deployment

### Option 1: VM Instance (Recommended for internal use)

1. Create an OCI Compute instance (Ubuntu 22.04, minimum 2GB RAM)
2. Open ports 80/443 in Security List
3. Install Node.js: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash - && sudo apt install nodejs`
4. Clone/upload the project to the VM
5. Install dependencies: `cd server && npm install && cd ../client && npm install`
6. Build the frontend: `cd client && npm run build`
7. Serve the `client/dist` folder using the Express server (add static file serving in `index.js`)
8. Use PM2 for process management: `npm install -g pm2 && pm2 start server/index.js`
9. Configure Nginx as a reverse proxy

### Option 2: OCI Container Instances

Build a Docker image and deploy to OCI Container Instances or OKE.

### Environment Variables in Production

Set `GEMINI_API_KEY` as an OCI Vault secret or environment variable on the instance. Never bake it into the container image.

## Security Notes

- API key is backend-only — never exposed to the browser
- Input is validated with Zod before processing
- Rate limiting: 30 requests per 15 minutes per IP
- Helmet.js security headers enabled
- Filenames sanitized before use in HTTP headers
- No permanent storage of submitted updates
