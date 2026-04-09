import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { PDFDocument } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const CHALLENGE_ID = 2;
const CHALLENGE_FILE_KEY = '09';

function parseArgs(argv) {
  const args = { all: false, merge: false, userId: null, outDir: 'output/certificates-ch9' };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (token === '--all') {
      args.all = true;
      continue;
    }

    if (token === '--merge') {
      args.merge = true;
      continue;
    }

    if (token === '--user') {
      const value = argv[i + 1];
      if (!value || Number.isNaN(Number(value))) {
        throw new Error('Gia tri --user khong hop le. Vi du: --user 9');
      }
      args.userId = Number(value);
      i += 1;
      continue;
    }

    if (token === '--out') {
      const value = argv[i + 1];
      if (!value) {
        throw new Error('Gia tri --out khong hop le. Vi du: --out output/certificates-ch9');
      }
      args.outDir = value;
      i += 1;
    }
  }

  if (!args.all && args.userId === null) {
    args.all = true;
  }

  return args;
}

async function readJson(relativePath) {
  const absPath = path.join(projectRoot, relativePath);
  const content = await fs.readFile(absPath, 'utf8');
  return JSON.parse(content);
}

function toDateStringUTC(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateVi(date) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh'
  }).format(date);
}

function slugify(input) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'member';
}

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function computeStatsForUser(userId, challenge, records) {
  const start = new Date(`${challenge.start}T00:00:00Z`);
  const end = new Date(`${challenge.end}T00:00:00Z`);

  let totalDays = 0;
  let studyDays = 0;

  for (const d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    totalDays += 1;
    const key = toDateStringUTC(d);
    if (records[key] && records[key][String(userId)]) {
      studyDays += 1;
    }
  }

  const attendanceRate = totalDays > 0 ? Math.round((studyDays / totalDays) * 100) : 0;
  const today = new Date();
  const completionDate = end < today ? end : today;

  return {
    studyDays,
    totalDays,
    attendanceRate,
    completionDate: formatDateVi(completionDate)
  };
}

function renderCertificateHtml({ userName, challengeName, studyDays, totalDays, attendanceRate, completionDate }) {
  const safeUser = escapeHtml(String(userName).toUpperCase());
  const safeChallenge = escapeHtml(String(challengeName).toUpperCase());

  return `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Certificate</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;700;900&family=Playfair+Display:ital,wght@0,700;1,700&family=Mrs+Saint+Delafield&display=swap" rel="stylesheet" />
    <style>
      @page { size: A4; margin: 0; }
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; width: 210mm; height: 297mm; }
      body { font-family: 'Be Vietnam Pro', sans-serif; }
      .certificate-container {
        width: 210mm;
        height: 297mm;
        margin: 0 auto;
        background-color: #ffffff;
        position: relative;
      }
      .certificate {
        width: 100%;
        height: 100%;
        background-color: #ffffff;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 20mm;
        overflow: hidden;
      }
      .certificate::before {
        content: '';
        position: absolute;
        top: 10mm; left: 10mm; right: 10mm; bottom: 10mm;
        border: 2px solid #1e293b;
        z-index: 1;
      }
      .certificate::after {
        content: '';
        position: absolute;
        top: 12mm; left: 12mm; right: 12mm; bottom: 12mm;
        border: 1px solid #d97706;
        z-index: 1;
      }
      .corner-decor {
        position: absolute;
        width: 40mm;
        height: 40mm;
        border: 4px double #d97706;
        z-index: 2;
      }
      .top-left { top: 10mm; left: 10mm; border-right: none; border-bottom: none; }
      .top-right { top: 10mm; right: 10mm; border-left: none; border-bottom: none; }
      .bottom-left { bottom: 10mm; left: 10mm; border-right: none; border-top: none; }
      .bottom-right { bottom: 10mm; right: 10mm; border-left: none; border-top: none; }
      .certificate-header {
        font-size: 13px;
        font-weight: 700;
        color: #b45309;
        letter-spacing: 5px;
        text-transform: uppercase;
        margin-bottom: 5mm;
        z-index: 3;
      }
      .certificate-title {
        font-family: 'Playfair Display', serif;
        font-size: 40pt;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 10mm 0;
        line-height: 1.1;
        text-align: center;
        z-index: 3;
      }
      .presented-to {
        font-size: 13pt;
        margin-bottom: 4mm;
        color: #64748b;
        font-style: italic;
        font-weight: 400;
        z-index: 3;
      }
      .user-name {
        font-family: 'Playfair Display', serif;
        font-size: 44pt;
        font-weight: 900;
        color: #1e3a8a;
        margin: 0 0 5mm 0;
        border-bottom: 2px solid #d97706;
        padding-bottom: 3mm;
        display: inline-block;
        max-width: 88%;
        text-align: center;
        white-space: normal;
        overflow-wrap: anywhere;
        line-height: 1.2;
        z-index: 3;
      }
      .description {
        font-size: 14pt;
        color: #334155;
        margin-top: 5mm;
        font-weight: 300;
        z-index: 3;
      }
      .challenge-name {
        font-size: 36pt;
        font-weight: 900;
        text-transform: uppercase;
        margin: 5mm 0 15mm 0;
        letter-spacing: 3px;
        line-height: 1.08;
        text-align: center;
        background: linear-gradient(90deg, #1e3a8a 0%, #0891b2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.1));
        z-index: 3;
      }
      .stats-overview {
        display: flex;
        justify-content: center;
        gap: 20mm;
        width: 100%;
        margin-bottom: 15mm;
        z-index: 3;
      }
      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 40mm;
      }
      .icon-wrapper { margin-bottom: 2mm; color: #d97706; }
      .stat-value {
        font-size: 24pt;
        font-weight: 800;
        color: #0f172a;
      }
      .stat-label {
        font-size: 9pt;
        color: #64748b;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-top: 2mm;
        border-top: 1px solid #e2e8f0;
        padding-top: 2mm;
        width: 100%;
        text-align: center;
      }
      .certificate-footer {
        display: flex;
        justify-content: space-between;
        width: 75%;
        margin-top: 15mm;
        align-items: flex-end;
        z-index: 3;
      }
      .footer-col {
        text-align: center;
        width: 60mm;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }
      .signature-title {
        font-size: 9pt;
        font-weight: 700;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 2px;
      }
      .col-date .signature-title,
      .col-org .signature-title { margin-bottom: 35mm; }
      .signature-line {
        border-top: 1px solid #cbd5e1;
        margin-bottom: 3mm;
        width: 100%;
      }
      .signature-content {
        font-size: 12pt;
        font-weight: 600;
        color: #334155;
      }
      .col-org .signature-content { color: #1e3a8a; }
      .signed-hph {
        font-family: 'Mrs Saint Delafield', cursive;
        font-size: 55pt;
        color: #1e3a8a;
        position: absolute;
        bottom: 12mm;
        left: 0;
        right: 0;
        transform: rotate(-8deg);
        z-index: 10;
        line-height: 1;
        opacity: 0.9;
      }
      .website-footer {
        position: absolute;
        bottom: 14mm;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 9pt;
        color: #cbd5e1;
        font-weight: 400;
        letter-spacing: 3px;
        text-transform: lowercase;
        z-index: 3;
      }
      .challenge-name {
        background: none;
        -webkit-text-fill-color: #1e3a8a;
        color: #1e3a8a;
      }
      .certificate, .certificate * {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    </style>
  </head>
  <body>
    <div class="certificate-container">
      <div class="certificate">
        <div class="corner-decor top-left"></div>
        <div class="corner-decor top-right"></div>
        <div class="corner-decor bottom-left"></div>
        <div class="corner-decor bottom-right"></div>
        <div class="certificate-header">GIẤY CHỨNG NHẬN</div>
        <h1 class="certificate-title">Certificate of<br/>Achievement</h1>
        <div class="presented-to">Trân trọng trao tặng cho</div>
        <div class="user-name">${safeUser}</div>
        <div class="description">Đã nỗ lực và hoàn thành xuất sắc thử thách</div>
        <div class="challenge-name">${safeChallenge}</div>
        <div class="stats-overview">
          <div class="stat-item">
            <div class="icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div class="stat-value">${studyDays}/${totalDays}</div>
            <div class="stat-label">Ngày học</div>
          </div>
          <div class="stat-item">
            <div class="icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
                <circle cx="12" cy="12" r="2"></circle>
              </svg>
            </div>
            <div class="stat-value">${attendanceRate}%</div>
            <div class="stat-label">Kỷ luật</div>
          </div>
        </div>
        <div class="certificate-footer">
          <div class="footer-col col-date">
            <div class="signature-title">Ngày cấp</div>
            <div class="signature-line"></div>
            <div class="signature-content">${escapeHtml(completionDate)}</div>
          </div>
          <div class="footer-col col-org">
            <div class="signature-title">Ban tổ chức</div>
            <div class="signed-hph">Hph</div>
            <div class="signature-line"></div>
            <div class="signature-content">Anki Việt Nam</div>
          </div>
        </div>
        <div class="website-footer">ankivn.com</div>
      </div>
    </div>
  </body>
</html>`;
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function exportSinglePdf(browser, payload, targetPdfPath) {
  const page = await browser.newPage();
  try {
    await page.setContent(renderCertificateHtml(payload), { waitUntil: 'networkidle0' });
    await page.emulateMediaType('print');
    await page.pdf({
      path: targetPdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      preferCSSPageSize: true
    });
  } finally {
    await page.close();
  }
}

async function mergePdfs(inputPdfPaths, outputPath) {
  const merged = await PDFDocument.create();

  for (const pdfPath of inputPdfPaths) {
    const bytes = await fs.readFile(pdfPath);
    const doc = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    for (const p of pages) {
      merged.addPage(p);
    }
  }

  const mergedBytes = await merged.save();
  await fs.writeFile(outputPath, mergedBytes);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const users = await readJson('public/data/users.json');
  const challenges = await readJson('public/data/challenges.json');
  const records = await readJson(`public/data/challenge_${CHALLENGE_FILE_KEY}_records.json`);
  const challenge = challenges[String(CHALLENGE_ID)];

  if (!challenge) {
    throw new Error(`Khong tim thay challenge ${CHALLENGE_ID} trong challenges.json`);
  }

  const eligibleUsers = (users.data || [])
    .filter((u) => Array.isArray(u.challengeIds) && u.challengeIds.includes(CHALLENGE_ID) && u.hidden !== true)
    .sort((a, b) => a.id - b.id);

  const selectedUsers = args.userId !== null
    ? eligibleUsers.filter((u) => u.id === args.userId)
    : eligibleUsers;

  if (selectedUsers.length === 0) {
    throw new Error('Khong co user nao phu hop voi bo loc hien tai.');
  }

  const outputRoot = path.resolve(projectRoot, args.outDir);
  const outputIndividual = path.join(outputRoot, 'individual');
  await ensureDir(outputIndividual);

  console.log(`Challenge: ${challenge.name} (${CHALLENGE_ID})`);
  console.log(`So thanh vien duoc xuat: ${selectedUsers.length}`);
  console.log(`Thu muc output: ${outputRoot}`);

  const browser = await puppeteer.launch({ headless: true });
  const exportedFiles = [];

  try {
    for (const user of selectedUsers) {
      const stats = computeStatsForUser(user.id, challenge, records);
      const pdfFileName = `cert_${user.id}_${slugify(user.name)}.pdf`;
      const targetPdfPath = path.join(outputIndividual, pdfFileName);

      await exportSinglePdf(browser, {
        userName: user.name,
        challengeName: challenge.name,
        studyDays: stats.studyDays,
        totalDays: stats.totalDays,
        attendanceRate: stats.attendanceRate,
        completionDate: stats.completionDate
      }, targetPdfPath);

      exportedFiles.push(targetPdfPath);
      console.log(`Da xuat: ${pdfFileName}`);
    }
  } finally {
    await browser.close();
  }

  if (args.merge) {
    const mergedPath = path.join(outputRoot, 'challenge_09_all_certificates.pdf');
    await mergePdfs(exportedFiles, mergedPath);
    console.log(`Da merge: ${mergedPath}`);
  }

  console.log('Hoan tat.');
}

main().catch((error) => {
  console.error('Loi khi export cert:', error.message);
  process.exit(1);
});
