// client/src/utils/pdfGenerator.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "/logo.png";

export const generateQuotationPDF = (quotation) => {
  try {
    // Validate input data
    if (!quotation || !quotation.party || !quotation.components) {
      throw new Error("Invalid quotation data");
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Colors - Exact orange theme from navbar
    const primaryColor = [38, 73, 122]; // #26497a in RGB // Exact orange from your navbar
    const secondaryColor = [245, 136, 69]; // Lighter variant
    const textColor = [51, 51, 51]; // Dark gray
    const lightGray = [248, 248, 248];
    const watermarkColor = [215, 116, 49]; // Same orange for watermarks
    const borderColor = [200, 200, 200];

    // Helper function to add colored rectangle
    const addColoredRect = (x, y, width, height, color) => {
      doc.setFillColor(...color);
      doc.rect(x, y, width, height, "F");
    };

    // Add enhanced PC component watermarks
    const addEnhancedWatermarks = () => {
      // Set low opacity for watermarks
      doc.setGState(new doc.GState({ opacity: 0.08 }));
      doc.setTextColor(...watermarkColor);

      doc.setGState(new doc.GState({ opacity: 0.4 }));
      doc.addImage(
        logo,
        "PNG",
        (pageWidth - 100) / 2,
        (pageHeight - 100) / 2,
        100,
        100
      );
      doc.setGState(new doc.GState({ opacity: 1 }));
    };

    // Add enhanced watermarks first
    addEnhancedWatermarks();

    // Header Section
    addColoredRect(0, 0, pageWidth, 35, primaryColor);

    doc.setTextColor(...primaryColor);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.addImage(logo, "PNG", 2, 1.5, 30, 30);

    // Company Name and Details
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("EMPRESSPC.IN", 28, 14);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("MS-101, Sector D, Aliganj, Lucknow", 28, 18);
    doc.text("Phone no.: 8881123430", 28, 22);
    doc.text("Email: sales@empresspc.in", 28, 26);
    doc.text("GSTIN: 09AALCD1630P1Z9", 28, 30);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const quotationNo = quotation.title || "Q-2025-001";
    const quotationDate = quotation.createdAt
      ? new Date(quotation.createdAt).toLocaleDateString("en-IN")
      : new Date().toLocaleDateString("en-IN");
    const placeOfSupply = quotation.party.address || "09-Uttar Pradesh";

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`Estimate No.: ${quotationNo}`, pageWidth - 13, 13, {
      align: "right",
    });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${quotationDate}`, pageWidth - 13, 22, { align: "right" });

    // Company and Client details section
    doc.setTextColor(...textColor);
    let yPos = 45;

    // Client info - LEFT SIDE WITHOUT BACKGROUND (UPDATED SECTION)
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Estimate For:", 10, yPos + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const partyName = quotation.party.name || "Customer";
    const partyPhone = quotation.party.phone || "N/A";
    const partyAddress = quotation.party.address || "Address";

    doc.text(`${partyName} (${partyPhone})`, 10, yPos + 10);

    // Handle address wrapping
    const addressLines = doc.splitTextToSize(partyAddress, 80);
    addressLines.slice(0, 2).forEach((line, index) => {
      doc.text(line, 10, yPos + 14 + index * 4);
    });

    doc.text(`Contact No.: ${partyPhone}`, 10, yPos + 22);

    // Components Table
    yPos += 35;

    // Prepare table data - matching PrintMode structure
    const tableData = [];
    quotation.components.forEach((comp, index) => {
      const categoryName =
        comp.category && comp.category.name ? comp.category.name : "Category";
      const brandName =
        comp.brand && comp.brand.name ? comp.brand.name : "Brand";
      const componentName =
        comp.model && comp.model.name
          ? comp.model.name
          : comp.name || "Component";
      const warranty = comp.warranty || "Standard";
      const quantity = comp.quantity || 1;

      tableData.push([
        String(index + 1),
        brandName,
        componentName + "\n" + categoryName,
        warranty,
        String(quantity),
        "Pcs",
      ]);
    });

    // Create table matching PrintMode design
    autoTable(doc, {
      startY: yPos,
      head: [["S.No.", "Brand", "Item name", "Warranty", "Qty(In Units)"]],
      body: tableData,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: textColor,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: lightGray,
        textColor: textColor,
        fontStyle: "bold",
        fontSize: 8,
        halign: "left",
      },
      columnStyles: {
        0: { cellWidth: pageWidth * 0.06, halign: "center" },
        1: { cellWidth: pageWidth * 0.15, fontSize: 8, halign: "left" },
        2: { cellWidth: pageWidth * 0.53, fontSize: 8, halign: "left" },
        3: { cellWidth: 20, halign: "center" },
        5: { cellWidth: 15, halign: "center" },
      },
      alternateRowStyles: {
        fillColor: [252, 252, 252],
      },
      margin: { left: 5, right: 5 },
    });

    // Get the final Y position after the table
    const finalY = doc.lastAutoTable.finalY + 10;

    // Amount in words and summary section - combined in one table
    const totalAmount = quotation.totalAmount || 0;
    const amountInWords = convertNumberToWords(totalAmount);

    // Create combined table with amount in words and totals
    const combinedTableData = [
      ["Estimate Amount in Words", "Total"],
      [amountInWords, `Rs. ${totalAmount.toLocaleString("en-IN")}`],
    ];

    autoTable(doc, {
      startY: finalY,
      body: combinedTableData,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: textColor,
        lineColor: borderColor,
        lineWidth: 0.5,
      },
      columnStyles: {
        0: { cellWidth: (pageWidth - 20) * 0.65, halign: "left" },
        1: { cellWidth: (pageWidth - 20) * 0.35, halign: "center" },
      },
      bodyStyles: {
        0: { fillColor: lightGray, fontStyle: "bold" }, // Header row - both cells bold
        1: {
          0: { fontStyle: "normal" }, // Amount in words - normal
          1: { fontStyle: "bold" }, // Total amount - bold
        },
      },
      margin: { left: 10, right: 15 },
    });

    // Calculate footer position - stick to bottom
    const footerHeight = 25;
    const footerY = pageHeight - footerHeight;

    // Calculate bank details and terms position - right above footer
    const bankTermsHeight = 35;
    const bottomY = footerY - bankTermsHeight - 5;

    // Bank Details (left) and Terms (right) - Enhanced styling
    const bankDetailsX = 10;
    const termsX = pageWidth / 2 + 5;
    const sectionWidth = (pageWidth - 30) / 2;

    // Bank Details with enhanced border
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(1);
    addColoredRect(
      bankDetailsX,
      bottomY,
      sectionWidth,
      bankTermsHeight,
      lightGray
    );
    doc.rect(bankDetailsX, bottomY, sectionWidth, bankTermsHeight, "S"); // Add border

    doc.setTextColor(...primaryColor);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Bank Details", bankDetailsX + 2, bottomY + 6);

    doc.setTextColor(...textColor);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Name: KOTAK MAHINDRA BANK LIMITED",
      bankDetailsX + 2,
      bottomY + 12
    );
    doc.text("Account No.: 8707304202", bankDetailsX + 2, bottomY + 16);
    doc.text("IFSC code: KKBK0005194", bankDetailsX + 2, bottomY + 20);
    doc.text(
      "Account holder: DIGINEXT PRO SOLUTIONS",
      bankDetailsX + 2,
      bottomY + 24
    );
    doc.text("PRIVATE LIMITED", bankDetailsX + 2, bottomY + 28);

    // Terms and Conditions with enhanced border
    addColoredRect(termsX, bottomY, sectionWidth, bankTermsHeight, lightGray);
    doc.rect(termsX, bottomY, sectionWidth, bankTermsHeight, "S"); // Add border

    doc.setTextColor(...primaryColor);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Terms and conditions", termsX + 2, bottomY + 6);

    doc.setTextColor(...textColor);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    const terms = [
      "1. Quote Is Valid For 7 Days Only!",
      "2. Payment terms: 100% advance",
      "3. Delivery: Within 7 working days",
      "4. Warranty: As per manufacturer",
    ];

    terms.forEach((term, index) => {
      doc.text(term, termsX + 4, bottomY + 12 + index * 4);
    });

    // Footer with signature and enhanced styling - Now at bottom
    addColoredRect(0, footerY, pageWidth, footerHeight, primaryColor);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Authorized Signatory", 10, footerY + 21);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Generated: ${new Date().toLocaleDateString(
        "en-IN"
      )} ${new Date().toLocaleTimeString("en-IN")}`,
      pageWidth - 5,
      footerY + 22,
      { align: "right" }
    );
    // doc.text(
    //   "Custom PC Solutions & Premium Components",
    //   pageWidth - 10,
    //   footerY + 14,
    //   { align: "right" }
    // );

    return doc;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};

// Helper function to convert number to words (improved Indian format)
const convertNumberToWords = (amount) => {
  try {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const convertHundreds = (num) => {
      let result = "";
      if (num >= 100) {
        result += ones[Math.floor(num / 100)] + " Hundred ";
        num %= 100;
      }
      if (num >= 20) {
        result += tens[Math.floor(num / 10)] + " ";
        num %= 10;
      }
      if (num > 0) {
        result += ones[num] + " ";
      }
      return result;
    };

    let rupees = Math.floor(amount);
    const paisa = Math.round((amount - rupees) * 100);

    let result = "";

    if (rupees >= 10000000) {
      // Crores
      result += convertHundreds(Math.floor(rupees / 10000000)) + "Crore ";
      rupees %= 10000000;
    }
    if (rupees >= 100000) {
      // Lakhs
      result += convertHundreds(Math.floor(rupees / 100000)) + "Lakh ";
      rupees %= 100000;
    }
    if (rupees >= 1000) {
      // Thousands
      result += convertHundreds(Math.floor(rupees / 1000)) + "Thousand ";
      rupees %= 1000;
    }
    if (rupees > 0) {
      result += convertHundreds(rupees);
    }

    result += "Rupees";

    if (paisa > 0) {
      result += " and " + convertHundreds(paisa) + "Paisa";
    }

    return result.trim() + " only";
  } catch (error) {
    console.error("Error converting number to words:", error);
    return `${amount.toFixed(2)} Rupees only`;
  }
};

// Helper function to format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

// Helper function to validate quotation data before PDF generation
export const validateQuotationData = (quotation) => {
  if (!quotation) {
    throw new Error("Quotation data is required");
  }

  if (!quotation.party) {
    throw new Error("Party information is required");
  }

  if (!quotation.components || quotation.components.length === 0) {
    throw new Error("At least one component is required");
  }

  if (!quotation.totalAmount || quotation.totalAmount <= 0) {
    throw new Error("Valid total amount is required");
  }

  return true;
};
