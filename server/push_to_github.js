import { execSync } from 'child_process';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Try to read token from Windows Credential Manager
function getTokenFromCredentialManager() {
  const ps = `
Add-Type -AssemblyName System.Runtime.InteropServices
Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Text;
public class WinCred {
    [DllImport("advapi32.dll", EntryPoint="CredReadW", CharSet=CharSet.Unicode, SetLastError=true)]
    public static extern bool CredRead(string target, int type, int flags, out IntPtr credential);
    [DllImport("advapi32.dll", EntryPoint="CredFree")]
    public static extern void CredFree(IntPtr cred);
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public struct CREDENTIAL {
        public int Flags; public int Type; public string TargetName;
        public string Comment; public long LastWritten; public int CredentialBlobSize;
        public IntPtr CredentialBlob; public int Persist; public int AttributeCount;
        public IntPtr Attributes; public string TargetAlias; public string UserName;
    }
    public static string GetCredential(string target) {
        IntPtr ptr;
        if (!CredRead(target, 1, 0, out ptr)) return null;
        CREDENTIAL cred = (CREDENTIAL)Marshal.PtrToStructure(ptr, typeof(CREDENTIAL));
        byte[] bytes = new byte[cred.CredentialBlobSize];
        Marshal.Copy(cred.CredentialBlob, bytes, 0, bytes.Length);
        CredFree(ptr);
        return Encoding.Unicode.GetString(bytes);
    }
}
"@
$t1 = [WinCred]::GetCredential("git:https://github.com")
$t2 = [WinCred]::GetCredential("git:https://siddharth19csk@github.com")
if ($t1) { Write-Output $t1 } elseif ($t2) { Write-Output $t2 } else { Write-Output "NOT_FOUND" }
`;

  try {
    const result = execSync(`powershell -Command "${ps.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 15000
    }).toString().trim();
    return result !== 'NOT_FOUND' && result.length > 10 ? result : null;
  } catch (e) {
    return null;
  }
}

function githubRequest(method, urlPath, body, token) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'api.github.com',
      path: urlPath,
      method,
      headers: {
        Authorization: `token ${token}`,
        'User-Agent': 'tc-doc-pusher/1.0',
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString();
        try { resolve({ status: res.statusCode, body: JSON.parse(text) }); }
        catch { resolve({ status: res.statusCode, body: text }); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function getFileSha(relPath, token) {
  const r = await githubRequest('GET', `/repos/siddharth19csk/TC_document_generator/contents/${relPath}?ref=main`, null, token);
  if (r.status === 200) return r.body.sha;
  if (r.status === 404) return null;
  throw new Error(`getFileSha failed for ${relPath}: ${r.status} ${JSON.stringify(r.body)}`);
}

async function pushFile(relPath, token, commitMsg) {
  const absPath = path.resolve(ROOT, relPath);
  if (!fs.existsSync(absPath)) { console.log(`  SKIP (not found): ${relPath}`); return; }

  const content = fs.readFileSync(absPath).toString('base64');
  const sha = await getFileSha(relPath, token);

  const body = { message: commitMsg, content, branch: 'main', ...(sha ? { sha } : {}) };
  const r = await githubRequest('PUT', `/repos/siddharth19csk/TC_document_generator/contents/${relPath}`, body, token);

  if (r.status === 200 || r.status === 201) {
    console.log(`  ✓ ${relPath}`);
  } else {
    console.error(`  ✗ FAILED (${r.status}) ${relPath}: ${r.body?.message || ''}`);
    throw new Error(`Push failed for ${relPath}`);
  }
}

async function main() {
  const token = process.argv[2] || process.env.GITHUB_TOKEN || getTokenFromCredentialManager();

  if (!token) {
    console.error('ERROR: Could not retrieve GitHub token automatically.');
    console.error('Run: node push_to_github.js <YOUR_GITHUB_TOKEN>');
    process.exit(1);
  }

  // Verify token works
  const whoami = await githubRequest('GET', '/user', null, token);
  if (whoami.status !== 200) {
    console.error('ERROR: Token invalid or expired. Status:', whoami.status);
    process.exit(1);
  }
  console.log(`\n✅ Authenticated as: ${whoami.body.login}`);

  const commitMsg = 'feat: add Help Guide button replacing XF Ready pill + PDF modal dialog\n\n- Help Guide button in header (replaces OneStream XF Ready badge)\n- Modal dialog with embedded PDF viewer and Neat Prompts quick-fill tab\n- Express routes serving /Help_Document.pdf and /Help_Document.docx\n- Rebuilt client bundle';

  // Get actual dist asset filenames
  const distAssetsDir = path.resolve(ROOT, 'client/dist/assets');
  const distFiles = fs.existsSync(distAssetsDir) ? fs.readdirSync(distAssetsDir) : [];
  const cssFile = distFiles.find(f => f.endsWith('.css'));
  const jsFile = distFiles.find(f => f.endsWith('.js'));

  const filesToPush = [
    'client/src/App.jsx',
    'client/src/index.css',
    'client/dist/index.html',
    'server/index.js',
    'server/build_help_guide_pdf.js',
    ...(cssFile ? [`client/dist/assets/${cssFile}`] : []),
    ...(jsFile ? [`client/dist/assets/${jsFile}`] : []),
  ];

  console.log(`\nPushing ${filesToPush.length} files to GitHub (siddharth19csk/TC_document_generator@main)...\n`);

  for (const f of filesToPush) {
    await pushFile(f, token, commitMsg);
  }

  console.log('\n✅ All files pushed! Render will auto-redeploy in ~1-2 minutes.');
  console.log('   Live site: https://tc-document-generator.onrender.com');
  console.log('   Render dashboard: https://dashboard.render.com');
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
