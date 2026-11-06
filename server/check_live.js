import https from 'https';

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ url, status: res.statusCode, length: data.length, snippet: data.slice(0, 200) });
      });
    }).on('error', err => resolve({ url, error: err.message }));
  });
}

async function main() {
  const js = await checkUrl('https://tc-document-generator.onrender.com/assets/index-DasjJNIj.js');
  console.log('JS:', js.status, 'len:', js.length);
  const css = await checkUrl('https://tc-document-generator.onrender.com/assets/index-CD8SMCef.css');
  console.log('CSS:', css.status, 'len:', css.length);
  const pdf = await checkUrl('https://tc-document-generator.onrender.com/Help_Document.pdf');
  console.log('PDF:', pdf.status, 'len:', pdf.length);
}

main();
