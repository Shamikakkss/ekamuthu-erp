import jsPDF from 'jspdf';
import autoTableImport from 'jspdf-autotable';

// Safely get autoTable function in both ESM & CommonJS module environments
const autoTable = typeof autoTableImport === 'function' 
    ? autoTableImport 
    : (autoTableImport.default || autoTableImport);

// 1. Single Payment Receipt PDF
export const generateReceiptPDF = (payment) => {
    try {
        if (!payment) {
            alert('No payment data available to generate receipt.');
            return;
        }

        const doc = new jsPDF();

        // Header Background
        doc.setFillColor(16, 185, 129); // Emerald color
        doc.rect(0, 0, 210, 30, 'F');

        // Header Text
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('EKAMUTHU ERP', 15, 18);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Official Payment Receipt', 195, 18, { align: 'right' });

        // Receipt Meta Info
        const receiptNo = payment.receiptNo || `REC-${payment._id?.slice(-6).toUpperCase() || Date.now()}`;
        const paidDate = new Date(payment.createdAt || Date.now()).toLocaleDateString();

        doc.setTextColor(100);
        doc.text(`Receipt No: ${receiptNo}`, 15, 42);
        doc.text(`Date: ${paidDate}`, 195, 42, { align: 'right' });

        doc.setLineWidth(0.5);
        doc.setDrawColor(220);
        doc.line(15, 46, 195, 46);

        // Member Details Table
        autoTable(doc, {
            startY: 52,
            theme: 'plain',
            body: [
                ['Member Name:', payment.member?.fullName || 'N/A'],
                ['Membership No:', payment.member?.membershipNo || 'N/A'],
                ['Payment Type:', payment.paymentType || payment.type || 'Monthly Subscription'],
                ['Target Month:', payment.monthYear || 'N/A'],
                ['Payment Method:', payment.paymentMethod || 'Cash'],
                ['Remarks:', payment.remarks || 'None'],
            ],
            styles: { fontSize: 10, cellPadding: 3 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 } }
        });

        // Payment Amount Box
        const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 110) + 10;
        doc.setFillColor(243, 244, 246);
        doc.roundedRect(15, finalY, 180, 25, 3, 3, 'F');

        doc.setFontSize(11);
        doc.setTextColor(50);
        doc.text('Total Amount Paid:', 25, finalY + 16);

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129);
        doc.text(`LKR ${Number(payment.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 185, finalY + 16, { align: 'right' });

        // Footer
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(150);
        doc.text('This is a computer-generated official receipt. No physical signature required.', 105, 280, { align: 'center' });

        // Save File
        const fileName = `Receipt_${payment.member?.membershipNo || 'Payment'}_${payment.monthYear || Date.now()}.pdf`;
        doc.save(fileName);
    } catch (err) {
        console.error('Error generating PDF receipt:', err);
        alert('Failed to generate receipt PDF: ' + err.message);
    }
};

// 2. Financial Summary Report PDF
export const generateFinancialReportPDF = (paymentsList = [], title = 'Financial Report') => {
    try {
        const payments = Array.isArray(paymentsList) ? paymentsList : [];

        if (payments.length === 0) {
            alert('No payment records available to export.');
            return;
        }

        const doc = new jsPDF();

        // Header
        doc.setFillColor(30, 41, 59); // Slate-800
        doc.rect(0, 0, 210, 25, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`EkamuthuERP - ${title}`, 15, 16);

        doc.setFontSize(9);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 195, 16, { align: 'right' });

        // Table Data Parsing
        const tableRows = payments.map((p, index) => [
            index + 1,
            new Date(p.createdAt || Date.now()).toLocaleDateString(),
            p.member?.membershipNo || 'N/A',
            p.member?.fullName || 'Unknown Member',
            p.paymentType || p.type || 'Subscription',
            p.monthYear || 'N/A',
            p.paymentMethod || 'Cash',
            `Rs. ${Number(p.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
        ]);

        autoTable(doc, {
            startY: 35,
            head: [['#', 'Date', 'Mem No', 'Member Name', 'Type', 'Month', 'Method', 'Amount']],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [16, 185, 129] },
            styles: { fontSize: 8.5 }
        });

        // Total Summary
        const totalAmount = payments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const autoY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 120;
        const finalY = autoY > 250 ? 25 : autoY + 12;

        if (autoY > 250) {
            doc.addPage();
        }

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30);
        doc.text(`Total Records: ${payments.length}`, 15, finalY);
        doc.text(`Total Collection: LKR ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 195, finalY, { align: 'right' });

        doc.save(`Financial_Report_${Date.now()}.pdf`);
    } catch (err) {
        console.error('Error generating PDF report:', err);
        alert('Failed to generate PDF report: ' + err.message);
    }
};