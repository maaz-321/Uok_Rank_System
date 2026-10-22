import puppeteer from 'puppeteer';

export const generateCVPdf = async (user, academicRecord) => {
  const qualifications = academicRecord?.qualifications || [];

  const qualificationRows = qualifications
    .map(
      (q) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #cbd5e1;"><b>${q.degreeLevel}</b><br><small>${q.degreeTitle}</small></td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">${q.boardOrUniversity}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">${q.majorSubjects || 'N/A'}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">${q.passingYear}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">${q.obtainedMarks} / ${q.totalMarks} (${q.percentage}%)</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">${q.gradeOrDivision || 'N/A'} ${q.cgpa ? `<br>CGPA: ${q.cgpa}` : ''}</td>
      </tr>
    `
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 30px; color: #1e293b; }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
        .name { font-size: 24px; font-weight: bold; color: #0f172a; margin: 0; }
        .sub-title { font-size: 13px; color: #475569; margin-top: 4px; }
        .section-title { font-size: 15px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #94a3b8; padding-bottom: 4px; margin-top: 20px; margin-bottom: 12px; text-transform: uppercase; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; }
        .info-item { margin-bottom: 4px; }
        .info-label { font-weight: bold; color: #334155; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
        th { background-color: #f1f5f9; color: #0f172a; padding: 8px; border: 1px solid #cbd5e1; text-align: left; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="name">${user.name}</h1>
          <div class="sub-title">Email: ${user.email} | Phone: ${user.phone || 'N/A'}</div>
        </div>
      </div>

      <div class="section-title">Personal & Contact Details</div>
      <div class="info-grid">
        <div class="info-item"><span class="info-label">Father Name:</span> ${academicRecord?.fatherName || 'N/A'}</div>
        <div class="info-item"><span class="info-label">CNIC / B-Form:</span> ${academicRecord?.cnicOrBForm || 'N/A'}</div>
        <div class="info-item"><span class="info-label">Gender:</span> ${academicRecord?.gender || 'N/A'}</div>
        <div class="info-item"><span class="info-label">Domicile District:</span> ${academicRecord?.domicileDistrict || 'N/A'}</div>
        <div class="info-item" style="grid-column: span 2;"><span class="info-label">Postal Address:</span> ${academicRecord?.postalAddress || 'N/A'}</div>
        <div class="info-item" style="grid-column: span 2;"><span class="info-label">Permanent Address:</span> ${academicRecord?.permanentAddress || 'N/A'}</div>
      </div>

      <div class="section-title">Academic Qualifications</div>
      <table>
        <thead>
          <tr>
            <th>Degree</th>
            <th>Board / University</th>
            <th>Major / Discipline</th>
            <th>Year</th>
            <th>Marks / Percentage</th>
            <th>Grade / CGPA</th>
          </tr>
        </thead>
        <tbody>
          ${qualificationRows || '<tr><td colspan="6" style="text-align:center; padding:12px;">No academic records found.</td></tr>'}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
  });
  await browser.close();

  return pdfBuffer;
};