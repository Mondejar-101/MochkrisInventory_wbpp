import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';

export const generatePurchaseOrderPDF = async (po, autoDownload = true) => {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    
    // Set up fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    const smallFontSize = 10;
    let yPosition = height - 50;
    
    // Function to add text with line break
    const addText = (text, size = fontSize, x = 50, isBold = false) => {
      page.drawText(text, {
        x,
        y: yPosition,
        size,
        font,
      });
      yPosition -= size + 5;
    };
    
    // Add title
    page.drawText('PURCHASE ORDER', {
      x: 50,
      y: yPosition,
      size: 20,
      font,
      color: rgb(0.1, 0.1, 0.5),
    });
    
    yPosition -= 40;
    
    // Add PO details
    const poNumber = po.poNumber || po.po_number || po.id || 'N/A';
    
    // PO Header
    addText(`PO Number: ${poNumber}`);
    addText(`Date: ${po.createdAt || new Date().toISOString().split('T')[0]}`);
    addText(`Status: ${po.status || 'N/A'}`);
    
    // Add supplier info if available
    if (po.supplier) {
      yPosition -= 20;
      addText(`Supplier: ${po.supplier.name || 'N/A'}`);
    }
    
    // Add a line separator
    yPosition -= 20;
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: width - 50, y: yPosition },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    yPosition -= 30;
    
    // Add items table header
    addText('ITEMS', 14, 50);
    yPosition -= 10;
    
    // Draw table headers
    page.drawText('Item', { x: 50, y: yPosition, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
    page.drawText('Qty', { x: 300, y: yPosition, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
    page.drawText('Price', { x: 350, y: yPosition, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
    page.drawText('Total', { x: 450, y: yPosition, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
    yPosition -= 25;
    
    // Draw items
    if (po.items && po.items.length > 0) {
      po.items.forEach((item) => {
        if (yPosition < 100) {
          // Add new page if we're running out of space
          page.drawText('Continued...', { x: 50, y: 50, size: fontSize, font });
          pdfDoc.addPage([600, 800]);
          yPosition = 780;
        }
        
        // Item name (with word wrap)
        const itemName = item.name || 'Unnamed Item';
        page.drawText(itemName, { 
          x: 50, 
          y: yPosition, 
          size: fontSize, 
          font,
          maxWidth: 240,
          lineHeight: 16
        });
        
        // Quantity
        page.drawText(String(item.quantity || 0), { 
          x: 300, 
          y: yPosition, 
          size: fontSize, 
          font 
        });
        
        // Price
        const price = item.price || item.unitPrice || 0;
        page.drawText(`PHP ${price.toFixed(2)}`, { 
          x: 350, 
          y: yPosition, 
          size: fontSize, 
          font 
        });
        
        // Total
        const total = (item.quantity || 0) * price;
        page.drawText(`PHP ${total.toFixed(2)}`, { 
          x: 450, 
          y: yPosition, 
          size: fontSize, 
          font 
        });
        
        yPosition -= 20;
      });
      
      // Add grand total
      yPosition -= 20;
      const grandTotal = po.items.reduce((sum, item) => {
        const price = item.price || item.unitPrice || 0;
        return sum + ((item.quantity || 0) * price);
      }, 0);
      
      page.drawText('Grand Total:', { 
        x: 350, 
        y: yPosition, 
        size: fontSize + 2, 
        font,
        color: rgb(0.2, 0.2, 0.2)
      });
      
      page.drawText(`PHP ${grandTotal.toFixed(2)}`, { 
        x: 450, 
        y: yPosition, 
        size: fontSize + 2, 
        font,
        color: rgb(0.2, 0.2, 0.2)
      });
    } else {
      addText('No items in this purchase order.');
    }
    
    // Add footer
    yPosition = 50;
    page.drawLine({
      start: { x: 50, y: yPosition + 10 },
      end: { x: width - 50, y: yPosition + 10 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    
    addText('Thank you for your business!', fontSize - 2, 50);
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    
    if (autoDownload) {
      saveAs(blob, `PO-${poNumber}.pdf`);
      return true;
    } else {
      return blob;
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Generate PDF for Requisition Form
export const generateRequisitionPDF = async (rf, autoDownload = true) => {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    
    // Set up fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    const smallFontSize = 10;
    let yPosition = height - 50;
    
    // Function to add text with line break
    const addText = (text, size = fontSize, x = 50, isBold = false) => {
      page.drawText(text, {
        x,
        y: yPosition,
        size,
        font,
      });
      yPosition -= size + 5;
    };
    
    // Add title
    page.drawText('REQUISITION FORM (RF)', {
      x: 50,
      y: yPosition,
      size: 20,
      font,
      color: rgb(0.1, 0.1, 0.5),
    });
    
    yPosition -= 40;
    
    // Add RF details
    const rfNumber = rf.id || 'N/A';
    
    // RF Header
    addText(`RF Number: ${rfNumber}`);
    addText(`Date: ${rf.requestDate || new Date().toISOString().split('T')[0]}`);
    addText(`Status: ${rf.status || 'N/A'}`);
    
    // Add supplier info if available
    if (rf.supplier) {
      yPosition -= 20;
      const supplierName = rf.supplier?.name || rf.supplier || 'N/A';
      addText(`Supplier: ${supplierName}`);
      if (rf.supplier?.contact) {
        addText(`Contact: ${rf.supplier.contact}`);
      }
      if (rf.supplier?.email) {
        addText(`Email: ${rf.supplier.email}`);
      }
    }
    
    // Add notes if available
    if (rf.notes) {
      yPosition -= 20;
      addText(`Notes: ${rf.notes}`);
    }
    
    // Add a line separator
    yPosition -= 20;
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: width - 50, y: yPosition },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    yPosition -= 30;
    
    // Add items table header
    addText('ITEMS', 14, 50);
    yPosition -= 10;
    
    // Draw table headers
    page.drawText('Item', { x: 50, y: yPosition, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
    page.drawText('Qty', { x: 300, y: yPosition, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
    page.drawText('Unit Price', { x: 350, y: yPosition, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
    page.drawText('Total', { x: 450, y: yPosition, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
    yPosition -= 25;
    
    // Draw items
    const items = rf.items || [{
      name: rf.item || 'Unknown Item',
      quantity: rf.qty || 1,
      unitPrice: rf.price || 0,
      price: rf.price || 0
    }];
    
    if (items.length > 0) {
      items.forEach((item) => {
        if (yPosition < 100) {
          // Add new page if we're running out of space
          page.drawText('Continued...', { x: 50, y: 50, size: fontSize, font });
          pdfDoc.addPage([600, 800]);
          yPosition = 780;
        }
        
        // Item name
        const itemName = item.name || item.item || 'Unnamed Item';
        page.drawText(itemName, { 
          x: 50, 
          y: yPosition, 
          size: fontSize, 
          font,
          maxWidth: 240,
          lineHeight: 16
        });
        
        // Quantity
        page.drawText(String(item.quantity || item.qty || 0), { 
          x: 300, 
          y: yPosition, 
          size: fontSize, 
          font 
        });
        
        // Price
        const price = item.price || item.unitPrice || 0;
        page.drawText(`PHP ${price.toFixed(2)}`, { 
          x: 350, 
          y: yPosition, 
          size: fontSize, 
          font 
        });
        
        // Total
        const quantity = item.quantity || item.qty || 0;
        const total = quantity * price;
        page.drawText(`PHP ${total.toFixed(2)}`, { 
          x: 450, 
          y: yPosition, 
          size: fontSize, 
          font 
        });
        
        yPosition -= 20;
      });
      
      // Add grand total
      yPosition -= 20;
      const grandTotal = items.reduce((sum, item) => {
        const price = item.price || item.unitPrice || 0;
        const quantity = item.quantity || item.qty || 0;
        return sum + (quantity * price);
      }, 0);
      
      page.drawText('Grand Total:', { 
        x: 350, 
        y: yPosition, 
        size: fontSize + 2, 
        font,
        color: rgb(0.2, 0.2, 0.2)
      });
      
      page.drawText(`PHP ${grandTotal.toFixed(2)}`, { 
        x: 450, 
        y: yPosition, 
        size: fontSize + 2, 
        font,
        color: rgb(0.2, 0.2, 0.2)
      });
    } else {
      addText('No items in this requisition form.');
    }
    
    // Add footer
    yPosition = 50;
    page.drawLine({
      start: { x: 50, y: yPosition + 10 },
      end: { x: width - 50, y: yPosition + 10 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    
    addText('Thank you for your business!', fontSize - 2, 50);
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    
    if (autoDownload) {
      saveAs(blob, `RF-${rfNumber}.pdf`);
      return true;
    } else {
      return blob;
    }
  } catch (error) {
    console.error('Error generating RF PDF:', error);
    throw error;
  }
};
