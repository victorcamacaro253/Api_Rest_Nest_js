import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';

@Injectable()
export class ExportService {
  
    async exportToExcel(data: any[]): Promise<Buffer> {
        let worksheet;
        
        if (data.length === 1) {
          // Single user - Column format
          const userData = data[0];
          const columnData = Object.entries(userData).map(([key, value]) => [key, value]);
          worksheet = XLSX.utils.aoa_to_sheet(columnData);
        } else {
          // Multiple users - Row format
          worksheet = XLSX.utils.json_to_sheet(data);
        }
    
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      }

  async exportToPDF(data: any[], headers: string[], title: string): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Add title
      doc.fontSize(20)
         .text(title, { align: 'center' })
         .moveDown(2);

      // Add timestamp
      doc.fontSize(10)
         .text(`Generated on: ${new Date().toLocaleString()}`)
         .moveDown();

      if (data.length === 1) {
        // Single user - Column format
        const startX = 50;
        let currentY = 150;
        const labelWidth = 150;
        const userData = data[0];

        headers.forEach(header => {
          doc.font('Helvetica-Bold')
             .fontSize(12)
             .text(header, startX, currentY);

          doc.font('Helvetica')
             .fontSize(10)
             .text(String(userData[header] || ''), startX + labelWidth, currentY);

          currentY += 30;

          if (currentY > 700) {
            doc.addPage();
            currentY = 50;
          }
        });
      } else {
        // Multiple users - Table format
        const tableTop = doc.y;
        const columnWidth = 100;
        const rowHeight = 30;
        let currentTop = tableTop;

        // Draw table headers
        doc.fontSize(12);
        headers.forEach((header, i) => {
          doc.font('Helvetica-Bold')
             .text(
               header,
               50 + (i * columnWidth),
               currentTop,
               { width: columnWidth, align: 'left' }
             );
        });

        // Draw horizontal line after headers
        currentTop += 20;
        doc.moveTo(50, currentTop)
           .lineTo(50 + (headers.length * columnWidth), currentTop)
           .stroke();
        currentTop += 10;

        // Draw data rows
        doc.font('Helvetica');
        data.forEach((row) => {
          headers.forEach((header, colIndex) => {
            doc.fontSize(10)
               .text(
                 String(row[header] || ''),
                 50 + (colIndex * columnWidth),
                 currentTop,
                 { width: columnWidth, align: 'left' }
               );
          });
          
          currentTop += rowHeight;

          if (currentTop > 700) {
            doc.addPage();
            currentTop = 50;
          }
        });
      }

      // Add page numbers
      let pages = doc.bufferedPageRange();
      for (let i = pages.start; i < pages.start + pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8)
           .text(
             `Page ${i + 1} of ${pages.count}`,
             50,
             doc.page.height - 50,
             { align: 'center' }
           );
      }

      doc.end();
    });
  }


  async exportToCSV(data: any[], fields: string[]): Promise<string> {
    const opts = {
      fields,
      delimiter: ',',
      quote: '"',
      header: true,
      flattenObjects: true
    };
    
    const parser = new Parser(opts);
    return parser.parse(data);
  }

  formatDataForExport(data: any[], type: string): any[] {
    return data.map(item => {
      const formattedItem = { ...item };
      
      // Format dates
      if (formattedItem.date) {
        formattedItem.date = new Date(formattedItem.date).toLocaleString();
      }
      
       // Format currency values
       if (formattedItem.price && typeof formattedItem.price === 'number') {
        formattedItem.price = `$${Number(formattedItem.price).toFixed(2)}`;
      }
      if (formattedItem.amount && typeof formattedItem.amount === 'number') {
        formattedItem.amount = `$${Number(formattedItem.amount).toFixed(2)}`;
      }
      // Remove sensitive or unnecessary data
      delete formattedItem.password;
      delete formattedItem.__v;
      
      return formattedItem;
    });
  }

  async exportPurchaseToPDF(data: any[], headers: string[], title: string): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Add title
      doc.fontSize(20)
         .text(title, { align: 'center' })
         .moveDown(2);

      // Add timestamp
      doc.fontSize(10)
         .text(`Generated on: ${new Date().toLocaleString()}`)
         .moveDown();

      // Table configuration with wider columns for products
      const tableTop = doc.y;
      const columnWidths = {
        purchase_id: 60,
        user: 80,
        amount: 60,
        date: 80,
        products: 200  // Wider column for products
      };
      
      let currentTop = tableTop;

      // Draw headers
      headers.forEach((header, i) => {
        doc.font('Helvetica-Bold')
           .fontSize(10)
           .text(
             header,
             50 + Object.values(columnWidths).slice(0, i).reduce((sum, width) => sum + width, 0),
             currentTop,
             { width: columnWidths[header], align: 'left' }
           );
      });

      currentTop += 20;

      // Draw data rows
data.forEach(row => {
    const rowStart = currentTop;
    let maxHeight = 0;
  
    headers.forEach((header, i) => {
      const x = 50 + Object.values(columnWidths).slice(0, i).reduce((sum, width) => sum + width, 0);
      const text = String(row[header] || '');
      
      const textHeight = doc.font('Helvetica')
                           .fontSize(8)
                           .heightOfString(text, { width: columnWidths[header] });
      
      maxHeight = Math.max(maxHeight, textHeight);
      
      doc.text(text, x, currentTop, {
        width: columnWidths[header], // Ensure the text wraps within the column width
        align: 'left'
      });
    });
  
    currentTop += maxHeight + 10; // Move to the next row based on max height
  
    if (currentTop > 700) {
      doc.addPage();
      currentTop = 50;
    }
  });
  
      // Add page numbers
      let pages = doc.bufferedPageRange();
      for (let i = pages.start; i < pages.start + pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8)
           .text(
             `Page ${i + 1} of ${pages.count}`,
             50,
             doc.page.height - 50,
             { align: 'center' }
           );
      }

      doc.end();
    });
  }

}
