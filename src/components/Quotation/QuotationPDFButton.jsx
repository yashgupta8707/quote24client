// client/src/components/Quotation/QuotationPDFButton.js
import React, { useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { generateQuotationPDF } from '../../utils/pdfGenerator';

const QuotationPDFButton = ({ quotation, variant = 'primary', size = 'sm' }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);
      
      // Validate quotation data first
      if (!quotation || !quotation.party || !quotation.components) {
        alert('Invalid quotation data. Please check the quotation details.');
        return;
      }
      
      // Generate PDF (now synchronous again)
      const pdf = generateQuotationPDF(quotation);
      
      // Create filename
      const partyName = quotation.party.name || 'customer';
      const quotationTitle = quotation.title || 'quotation';
      const filename = `${quotationTitle}_${partyName.replace(/\s+/g, '_')}.pdf`;
      
      // Download the PDF
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleDownloadPDF}
      disabled={isGenerating}
      className="me-2"
    >
      {isGenerating ? (
        <>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
            className="me-2"
          />
          Generating...
        </>
      ) : (
        <>
          <i className="fas fa-file-pdf me-2"></i>
          Download PDF
        </>
      )}
    </Button>
  );
};

export default QuotationPDFButton;