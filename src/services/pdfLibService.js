import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const STORAGE_KEYS = {
  CERT_TEMPLATE: 'erp_pdf_template_certificate',
  RECEIPT_TEMPLATE: 'erp_pdf_template_receipt'
};

/**
 * PDF-Lib Service for Dynamic PDF Template Loading, Editing & Data Ingestion
 */
export const pdfLibService = {
  // Store custom uploaded template PDF (Base64)
  saveTemplate: (type, base64Data) => {
    try {
      const key = type === 'receipt' ? STORAGE_KEYS.RECEIPT_TEMPLATE : STORAGE_KEYS.CERT_TEMPLATE;
      localStorage.setItem(key, base64Data);
      return true;
    } catch (err) {
      console.error('Failed to save PDF template:', err);
      return false;
    }
  },

  // Get custom uploaded template PDF (Base64)
  getTemplate: (type) => {
    try {
      const key = type === 'receipt' ? STORAGE_KEYS.RECEIPT_TEMPLATE : STORAGE_KEYS.CERT_TEMPLATE;
      return localStorage.getItem(key);
    } catch (err) {
      return null;
    }
  },

  // Clear template
  clearTemplate: (type) => {
    const key = type === 'receipt' ? STORAGE_KEYS.RECEIPT_TEMPLATE : STORAGE_KEYS.CERT_TEMPLATE;
    localStorage.removeItem(key);
  },

  /**
   * Generates or Edits a Certificate PDF using pdf-lib
   */
  generateCertificate: async ({
    studentName = 'Rohan Adhikari',
    course = 'MERN Stack Web Development',
    certType = 'Course Completion',
    serialNo = 'TCIT-CERT-884102',
    issueDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    signatory = 'Dr. A. K. Banerjee (Academic Director)',
    institutionName = 'TALENT COMPUTER ACADEMY',
    accreditationText = 'ISO 9001:2015 Certified Educational Institute • Govt. Regd.',
    logoUrl = '/logo.png',
    customTemplateBase64 = null
  }) => {
    let pdfDoc;
    const existingTemplate = customTemplateBase64 || pdfLibService.getTemplate('certificate');

    if (existingTemplate) {
      // Load custom template uploaded by admin
      try {
        const templateBytes = Uint8Array.from(atob(existingTemplate.split(',')[1] || existingTemplate), c => c.charCodeAt(0));
        pdfDoc = await PDFDocument.load(templateBytes);
      } catch (err) {
        console.warn('Could not parse custom uploaded template, creating clean PDF canvas:', err);
        pdfDoc = await PDFDocument.create();
      }
    } else {
      // Create new clean landscape document
      pdfDoc = await PDFDocument.create();
    }

    let page = pdfDoc.getPageCount() > 0 ? pdfDoc.getPage(0) : pdfDoc.addPage([842, 595]); // A4 Landscape
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // If a demo template is uploaded or onlyName is true, ONLY overlay student name at the right place
    if (existingTemplate) {
      const nameFontSize = 28;
      const nameWidth = fontBold.widthOfTextAtSize(studentName, nameFontSize);
      page.drawText(studentName, {
        x: (width - nameWidth) / 2,
        y: height - 250, // Placed at the right position for standard certificate name slot
        size: nameFontSize,
        font: fontBold,
        color: rgb(0.12, 0.1, 0.29)
      });

      const pdfBytes = await pdfDoc.save();
      return pdfBytes;
    }

    // Default clean canvas rendering (when no custom template is uploaded)
    // Outer Amber Border
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: rgb(0.85, 0.47, 0.02), // #d97706
      borderWidth: 4,
      color: rgb(1, 0.98, 0.92) // #fffbeb
    });

    // Inner Border
    page.drawRectangle({
      x: 32,
      y: 32,
      width: width - 64,
      height: height - 64,
      borderColor: rgb(0.7, 0.32, 0.04), // #b45309
      borderWidth: 1.5
    });

    // Header Divider Line
    page.drawLine({
      start: { x: width / 2 - 100, y: height - 120 },
      end: { x: width / 2 + 100, y: height - 120 },
      thickness: 2,
      color: rgb(0.85, 0.47, 0.02)
    });

    // Try embedding image logo if available
    if (logoUrl) {
      try {
        const logoResp = await fetch(logoUrl);
        if (logoResp.ok) {
          const logoArrayBuffer = await logoResp.arrayBuffer();
          let logoImage;
          if (logoUrl.endsWith('.png') || logoUrl.startsWith('data:image/png')) {
            logoImage = await pdfDoc.embedPng(logoArrayBuffer);
          } else {
            logoImage = await pdfDoc.embedJpg(logoArrayBuffer);
          }
          page.drawImage(logoImage, {
            x: 60,
            y: height - 110,
            width: 65,
            height: 65
          });
        }
      } catch (e) {
        console.warn('Could not embed logo image into PDF:', e);
      }
    }

    // Dynamic Text Overlays
    const instText = institutionName.toUpperCase();
    const instWidth = fontBold.widthOfTextAtSize(instText, 24);
    page.drawText(instText, {
      x: (width - instWidth) / 2,
      y: height - 70,
      size: 24,
      font: fontBold,
      color: rgb(0.57, 0.25, 0.05) // #92400e
    });

    const certTitleText = `CERTIFICATE OF ${certType.toUpperCase()}`;
    const certTitleWidth = fontBold.widthOfTextAtSize(certTitleText, 13);
    page.drawText(certTitleText, {
      x: (width - certTitleWidth) / 2,
      y: height - 100,
      size: 13,
      font: fontBold,
      color: rgb(0.7, 0.32, 0.04)
    });

    // Presented To
    const presText = 'THIS IS PROUDLY PRESENTED TO';
    const presWidth = fontRegular.widthOfTextAtSize(presText, 10);
    page.drawText(presText, {
      x: (width - presWidth) / 2,
      y: height - 185,
      size: 10,
      font: fontRegular,
      color: rgb(0.39, 0.45, 0.55)
    });

    // Student Name (Prominent & Underlined)
    const nameWidth = fontBold.widthOfTextAtSize(studentName, 26);
    page.drawText(studentName, {
      x: (width - nameWidth) / 2,
      y: height - 230,
      size: 26,
      font: fontBold,
      color: rgb(0.12, 0.1, 0.29) // Indigo
    });

    page.drawLine({
      start: { x: (width - nameWidth) / 2 - 20, y: height - 240 },
      end: { x: (width + nameWidth) / 2 + 20, y: height - 240 },
      thickness: 1.5,
      color: rgb(0.85, 0.47, 0.02)
    });

    // Description
    const descLine1 = `for successfully completing the advanced industry curriculum & practical evaluations in`;
    const d1Width = fontRegular.widthOfTextAtSize(descLine1, 11);
    page.drawText(descLine1, {
      x: (width - d1Width) / 2,
      y: height - 280,
      size: 11,
      font: fontRegular,
      color: rgb(0.2, 0.25, 0.33)
    });

    const courseWidth = fontBold.widthOfTextAtSize(course, 14);
    page.drawText(course, {
      x: (width - courseWidth) / 2,
      y: height - 305,
      size: 14,
      font: fontBold,
      color: rgb(0.26, 0.22, 0.79)
    });

    const descLine2 = `with distinction in live project capstone builds and practical lab modules.`;
    const d2Width = fontRegular.widthOfTextAtSize(descLine2, 11);
    page.drawText(descLine2, {
      x: (width - d2Width) / 2,
      y: height - 330,
      size: 11,
      font: fontRegular,
      color: rgb(0.2, 0.25, 0.33)
    });

    // Footer Credentials & Signatures
    page.drawText(`Serial ID: ${serialNo}`, {
      x: 60,
      y: 80,
      size: 9,
      font: fontRegular,
      color: rgb(0.58, 0.64, 0.72)
    });

    page.drawText(`Issue Date: ${issueDate}`, {
      x: 60,
      y: 65,
      size: 9,
      font: fontRegular,
      color: rgb(0.58, 0.64, 0.72)
    });

    page.drawText(`OFFICIAL VERIFIED CERTIFICATE`, {
      x: (width - 170) / 2,
      y: 75,
      size: 9,
      font: fontBold,
      color: rgb(0.7, 0.32, 0.04)
    });

    // Signature Block
    const sigLineX = width - 220;
    page.drawLine({
      start: { x: sigLineX, y: 80 },
      end: { x: sigLineX + 160, y: 80 },
      thickness: 1,
      color: rgb(0.58, 0.64, 0.72)
    });

    const sigText = signatory;
    const sigWidth = fontBold.widthOfTextAtSize(sigText, 9);
    page.drawText(sigText, {
      x: sigLineX + (160 - sigWidth) / 2,
      y: 65,
      size: 9,
      font: fontBold,
      color: rgb(0.2, 0.25, 0.33)
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  },

  /**
   * Generates or Edits a Payment Receipt PDF using pdf-lib
   */
  generateReceipt: async ({
    studentName = 'Rohan Adhikari',
    studentId = 'AT-2024-089',
    course = 'Full Stack Web Development',
    receiptNo = 'REC-99482',
    amount = 15000,
    dateStr = new Date().toLocaleDateString('en-IN'),
    mode = 'Online Banking / GPay',
    institutionName = 'TALENT COMPUTER ACADEMY',
    address = 'Plot 42, Sector V, Salt Lake, Kolkata',
    gstin = '19AAACA1234F1Z9',
    logoUrl = '/logo.png',
    customTemplateBase64 = null
  }) => {
    let pdfDoc;
    const existingTemplate = customTemplateBase64 || pdfLibService.getTemplate('receipt');

    if (existingTemplate) {
      try {
        const templateBytes = Uint8Array.from(atob(existingTemplate.split(',')[1] || existingTemplate), c => c.charCodeAt(0));
        pdfDoc = await PDFDocument.load(templateBytes);
      } catch (err) {
        pdfDoc = await PDFDocument.create();
      }
    } else {
      pdfDoc = await PDFDocument.create();
    }

    let page = pdfDoc.getPageCount() > 0 ? pdfDoc.getPage(0) : pdfDoc.addPage([595, 842]); // A4 Portrait
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    if (!existingTemplate) {
      // Header Card Background
      page.drawRectangle({
        x: 30,
        y: height - 120,
        width: width - 60,
        height: 90,
        color: rgb(0.95, 0.97, 1),
        borderColor: rgb(0.8, 0.88, 1),
        borderWidth: 1
      });
    }

    // Try embedding logo image
    if (logoUrl) {
      try {
        const logoResp = await fetch(logoUrl);
        if (logoResp.ok) {
          const logoArrayBuffer = await logoResp.arrayBuffer();
          let logoImage;
          if (logoUrl.endsWith('.png') || logoUrl.startsWith('data:image/png')) {
            logoImage = await pdfDoc.embedPng(logoArrayBuffer);
          } else {
            logoImage = await pdfDoc.embedJpg(logoArrayBuffer);
          }
          page.drawImage(logoImage, {
            x: 45,
            y: height - 105,
            width: 60,
            height: 60
          });
        }
      } catch (e) {}
    }

    // Institution Branding
    page.drawText(institutionName.toUpperCase(), {
      x: 120,
      y: height - 60,
      size: 16,
      font: fontBold,
      color: rgb(0.12, 0.23, 0.54)
    });

    page.drawText(`${address} • GSTIN: ${gstin}`, {
      x: 120,
      y: height - 80,
      size: 9,
      font: fontRegular,
      color: rgb(0.39, 0.45, 0.55)
    });

    page.drawText('OFFICIAL PAYMENT RECEIPT', {
      x: width - 210,
      y: height - 60,
      size: 11,
      font: fontBold,
      color: rgb(0.02, 0.47, 0.34)
    });

    page.drawText(`Receipt #: ${receiptNo}`, {
      x: width - 210,
      y: height - 78,
      size: 10,
      font: fontBold,
      color: rgb(0.15, 0.39, 0.92)
    });

    page.drawText(`Date: ${dateStr}`, {
      x: width - 210,
      y: height - 94,
      size: 9,
      font: fontRegular,
      color: rgb(0.39, 0.45, 0.55)
    });

    // Student & Fee Details Table Box
    const boxY = height - 260;
    page.drawRectangle({
      x: 30,
      y: boxY,
      width: width - 60,
      height: 120,
      borderColor: rgb(0.89, 0.91, 0.94),
      borderWidth: 1,
      color: rgb(0.98, 0.99, 1)
    });

    page.drawText(`Student Name:`, { x: 45, y: boxY + 95, size: 9, font: fontRegular, color: rgb(0.39, 0.45, 0.55) });
    page.drawText(studentName, { x: 130, y: boxY + 95, size: 10, font: fontBold, color: rgb(0.06, 0.09, 0.16) });

    page.drawText(`Student ID:`, { x: 45, y: boxY + 70, size: 9, font: fontRegular, color: rgb(0.39, 0.45, 0.55) });
    page.drawText(studentId, { x: 130, y: boxY + 70, size: 10, font: fontBold, color: rgb(0.15, 0.39, 0.92) });

    page.drawText(`Enrolled Course:`, { x: 45, y: boxY + 45, size: 9, font: fontRegular, color: rgb(0.39, 0.45, 0.55) });
    page.drawText(course, { x: 130, y: boxY + 45, size: 10, font: fontBold, color: rgb(0.06, 0.09, 0.16) });

    page.drawText(`Payment Method:`, { x: 45, y: boxY + 20, size: 9, font: fontRegular, color: rgb(0.39, 0.45, 0.55) });
    page.drawText(mode, { x: 130, y: boxY + 20, size: 10, font: fontRegular, color: rgb(0.06, 0.09, 0.16) });

    // Amount Display Box
    page.drawRectangle({
      x: width - 230,
      y: boxY + 20,
      width: 180,
      height: 80,
      color: rgb(0.93, 0.99, 0.96),
      borderColor: rgb(0.65, 0.94, 0.8),
      borderWidth: 1
    });

    page.drawText(`TOTAL RECEIVED:`, { x: width - 215, y: boxY + 75, size: 9, font: fontBold, color: rgb(0.02, 0.47, 0.34) });
    page.drawText(`INR ${Number(amount).toLocaleString('en-IN')}`, { x: width - 215, y: boxY + 45, size: 18, font: fontBold, color: rgb(0.02, 0.47, 0.34) });
    page.drawText(`STATUS: PAID & CLEARED`, { x: width - 215, y: boxY + 30, size: 8, font: fontBold, color: rgb(0.02, 0.47, 0.34) });

    // Footer Disclaimer
    page.drawText(`This is a computer-generated official receipt created via pdf-lib module. Verified by Accounts Desk.`, {
      x: 30,
      y: 40,
      size: 8,
      font: fontRegular,
      color: rgb(0.58, 0.64, 0.72)
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  },

  /**
   * Helper function to trigger browser download of pdf-lib Uint8Array
   */
  downloadPdfBytes: (pdfBytes, filename = 'document.pdf') => {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Helper function to open pdf-lib Uint8Array in new browser preview window
   */
  previewPdfBytes: (pdfBytes) => {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }
};

export default pdfLibService;
