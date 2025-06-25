// src/lib/pdf-generator.ts
import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { PDFFormData } from '../types/pdf-generator.types';

export async function generatePDF(
  formData: PDFFormData,
  adminUserId: string = 'admin',
  heroImage?: string
): Promise<{ filename: string; filePath: string; fileSize: number }> {
  try {
    console.log('Starting PDF generation...');
    
    // Load and compile HTML template
    const templatePath = path.join(process.cwd(), 'src/templates/pdf-template.html');
    console.log('Loading template from:', templatePath);
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found at: ${templatePath}`);
    }
    
    const templateHtml = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateHtml);
    
    // Format dates for display
    const formatDate = (dateString?: string) => {
      if (!dateString) return '';
      try {
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch {
        return dateString;
      }
    };
    
    // Prepare data for template
    const templateData = {
      ...formData,
      heroImage,
      customerInfo: {
        ...formData.customerInfo,
        travelStartDate: formatDate(formData.customerInfo.travelStartDate?.toString()),
        travelEndDate: formatDate(formData.customerInfo.travelEndDate?.toString())
      },
      pricing: {
        ...formData.pricing,
        totalPackagePrice: formData.pricing.totalPackagePrice?.toLocaleString() || '0'
      },
      generatedDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
    
    console.log('Template data prepared');
    
    // Generate HTML with form data
    const html = template(templateData);
    console.log('HTML generated from template');
    
    // Launch Puppeteer and generate PDF
    console.log('Launching Puppeteer...');
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    console.log('Setting page content...');
    
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    console.log('Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { 
        top: '20px', 
        bottom: '40px', 
        left: '15px', 
        right: '15px' 
      },
      preferCSSPageSize: true
    });
    
    await browser.close();
    console.log('PDF generated successfully');
    
    // Generate filename
    const sanitizedCustomerName = formData.customerInfo.customerName
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Travel_Proposal_${sanitizedCustomerName}_${timestamp}.pdf`;
    
    // Ensure directory exists
    const publicDir = path.join(process.cwd(), 'public/generated-pdfs');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
      console.log('Created directory:', publicDir);
    }
    
    // Save PDF file
    const filePath = path.join(publicDir, filename);
    fs.writeFileSync(filePath, pdfBuffer);
    console.log('PDF saved to:', filePath);
    
    // Get file size
    const stats = fs.statSync(filePath);
    const fileSize = Math.round(stats.size / 1024); // Size in KB
    
    console.log(`PDF generation completed: ${filename} (${fileSize}KB)`);
    
    return {
      filename,
      filePath,
      fileSize
    };
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function getDownloadUrl(filename: string): string {
  return `/generated-pdfs/${filename}`;
}