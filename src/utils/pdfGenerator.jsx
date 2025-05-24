// client/src/utils/pdfGenerator.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "/logo.png"; // Adjust the path as necessary
import img1 from "/1.png";
import img2 from "/2.png";
import img3 from "/3.png";
import img4 from "/4.png";
import img5 from "/5.png";
import img6 from "/6.png";
import img7 from "/7.png";
import img8 from "/8.png";

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

      // RAM watermark (top-left)
      doc.setFontSize(20);
      doc.setGState(new doc.GState({ opacity: 0.4 }));
      doc.addImage(img8, "PNG", 35, 40, 60, 40);
      doc.setGState(new doc.GState({ opacity: 0.1 }));
      // GPU watermark (top-right)
      doc.setFontSize(20);
      doc.text("GPU", pageWidth - 35, 80, { angle: -20 });
      doc.setFontSize(10);
      doc.text("GRAPHICS", pageWidth - 45, 87, { angle: -20 });

      // SSD watermark (center-right)
      doc.setFontSize(20);
      doc.text("SSD", pageWidth - 40, pageHeight / 2, { angle: -10 });
      doc.setFontSize(10);
      doc.text("STORAGE", pageWidth - 50, pageHeight / 2 + 7, { angle: -10 });

      // CPU watermark (bottom-left)
      doc.setFontSize(20);
      doc.text("CPU", 30, pageHeight - 60, { angle: -15 });
      doc.setFontSize(10);
      doc.text("PROCESSOR", 25, pageHeight - 53, { angle: -15 });

      // Motherboard watermark (bottom-right)
      doc.setFontSize(20);
      doc.text("MOBO", pageWidth - 45, pageHeight - 70, { angle: 25 });
      doc.setFontSize(10);
      doc.text("MAINBOARD", pageWidth - 55, pageHeight - 63, { angle: 25 });

      // PSU watermark (left-center)
      doc.setFontSize(20);
      doc.text("PSU", 25, pageHeight / 2 + 30, { angle: 90 });
      doc.setFontSize(10);
      doc.text("POWER", 20, pageHeight / 2 + 50, { angle: 90 });

      // Additional tech terms
      doc.setFontSize(15);
      doc.text("GAMING", pageWidth / 2 - 60, 90, { angle: 30 });
      doc.text("CUSTOM", pageWidth / 2 + 40, pageHeight - 40, { angle: -30 });
      doc.text("BUILD", pageWidth / 4, pageHeight - 90, { angle: 45 });
      doc.text("TECH", (3 * pageWidth) / 4, 100, { angle: -45 });

      // Circuit elements
      doc.setFontSize(8);
      doc.text("[ ]", 15, 100);
      doc.text("[ ]", pageWidth - 25, 110);
      doc.text("[ ]", 30, pageHeight - 30);
      doc.text("[ ]", pageWidth - 40, pageHeight - 35);

      // Binary code pattern
      doc.setFontSize(6);
      doc.text("01001100 01101111 01110010 01100101", pageWidth / 2 - 40, 130, {
        angle: 15,
      });
      doc.text("01101101 00100000 01101001 01110000", pageWidth / 2 - 30, 140, {
        angle: 15,
      });
      doc.text("01110011 01110101 01101101 00100000", pageWidth / 2 - 20, 150, {
        angle: 15,
      });

      // Reset opacity
      doc.setGState(new doc.GState({ opacity: 1 }));
    };

    // Add enhanced watermarks first
    addEnhancedWatermarks();

    // Header Section
    addColoredRect(0, 0, pageWidth, 35, primaryColor);

    // // Logo area with better styling
    // doc.setFillColor(255, 255, 255);
    // doc.rect(10, 5, 25, 25, 'F');

    // // Add subtle border to logo area
    // doc.setDrawColor(...primaryColor);
    // doc.setLineWidth(0.5);
    // doc.rect(10, 5, 25, 25, 'S');

    doc.setTextColor(...primaryColor);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.addImage(logo, "PNG", 6, 2, 30, 30);

    // Company Name and Details
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Empress PC", 40, 15);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("MS-101, Sector D, Aliganj, Lucknow", 40, 22);
    doc.text("Phone no.: 8881123430", 40, 27);
    doc.text("Email: sales@empresspc.in", 40, 32);

    // Quotation title and details (right side)
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Estimate", pageWidth - 15, 15, { align: "right" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const quotationNo = quotation.title || "Q-2025-001";
    const quotationDate = quotation.createdAt
      ? new Date(quotation.createdAt).toLocaleDateString("en-IN")
      : new Date().toLocaleDateString("en-IN");
    const placeOfSupply = quotation.party.address || "09-Uttar Pradesh";

    doc.text(`Estimate No.: ${quotationNo}`, pageWidth - 15, 22, {
      align: "right",
    });
    doc.text(`Date: ${quotationDate}`, pageWidth - 15, 27, { align: "right" });
    doc.text(`Place of supply: ${placeOfSupply}`, pageWidth - 15, 32, {
      align: "right",
    });

    // Company and Client details section
    doc.setTextColor(...textColor);
    let yPos = 45;

    // Company info box with border only (transparent background)
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.5);
    doc.rect(10, yPos, (pageWidth - 20) / 2 - 5, 25, "S"); // 'S' for stroke only (border)

    doc.setTextColor(...textColor);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("From:", 12, yPos + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("EMPRESSPC.IN", 12, yPos + 10);
    doc.text("MS-101, Sector D, Aliganj, Lucknow", 12, yPos + 14);
    doc.text("GSTIN: 09AALCD1630P1Z9", 12, yPos + 18);
    doc.text("State: 09-Uttar Pradesh", 12, yPos + 22);

    // Client info box
    const clientX = pageWidth / 2 + 5;
    addColoredRect(clientX, yPos, (pageWidth - 20) / 2 - 5, 25, lightGray);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Estimate For:", clientX + 2, yPos + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const partyName = quotation.party.name || "Customer";
    const partyPhone = quotation.party.phone || "N/A";
    const partyAddress = quotation.party.address || "Address";

    doc.text(`${partyName}(${partyPhone})`, clientX + 2, yPos + 10);

    // Handle address wrapping
    const addressLines = doc.splitTextToSize(partyAddress, 80);
    addressLines.slice(0, 2).forEach((line, index) => {
      doc.text(line, clientX + 2, yPos + 14 + index * 4);
    });

    doc.text(`Contact No.: ${partyPhone}`, clientX + 2, yPos + 22);

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
        1: { cellWidth: pageWidth * 0.15, fontSize: 8, halign: "center" },
        2: { cellWidth: pageWidth * 0.53, fontSize: 8, halign: "center" },
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

    // // Amount in words section
    // const totalAmount = quotation.totalAmount || 0;
    // const amountInWords = convertNumberToWords(totalAmount);

    // addColoredRect(10, finalY, pageWidth - 20, 15, lightGray);
    // doc.setFontSize(9);
    // doc.setFont("helvetica", "bold");
    // doc.text("Estimate Amount in Words", 12, finalY + 5);
    // doc.setFont("helvetica", "normal");
    // doc.setFontSize(8);
    // doc.text(amountInWords, 12, finalY + 10);

    // // Financial Summary Section
    // const summaryY = finalY + 20;
    // addColoredRect(10, summaryY, pageWidth - 20, 10, lightGray);
    // doc.setFontSize(9);
    // doc.setFont("helvetica", "bold");
    // doc.text("Amounts", 12, summaryY + 6);

    // // Calculate totals
    // const subtotal = totalAmount / 1.18;
    // const gstAmount = totalAmount - subtotal;

    // let summaryDetailY = summaryY + 15;
    // doc.setFontSize(8);
    // doc.setFont("helvetica", "normal");

    // // Summary table
    // const summaryData = [
    //   ["Sub Total (without GST)", `₹${subtotal.toFixed(2)}`],
    //   ["Total GST", `₹${gstAmount.toFixed(2)}`],
    //   ["Total Amount", `₹${totalAmount.toFixed(2)}`],
    // ];

    // autoTable(doc, {
    //   startY: summaryDetailY,
    //   body: summaryData,
    //   theme: "grid",
    //   styles: {
    //     fontSize: 8,
    //     cellPadding: 2,
    //     textColor: textColor,
    //     lineColor: [200, 200, 200],
    //     lineWidth: 0.1,
    //   },
    //   columnStyles: {
    //     0: { cellWidth: pageWidth - 60, halign: "left" },
    //     1: { cellWidth: 40, halign: "right", fontStyle: "bold" },
    //   },
    //   bodyStyles: {
    //     2: { fillColor: lightGray, fontStyle: "bold" }, // Total row
    //   },
    //   margin: { left: 10, right: 10 },
    // });

    // Amount in words and summary section - combined in one table
    const totalAmount = quotation.totalAmount || 0;
    const amountInWords = convertNumberToWords(totalAmount);

    // Create combined table with amount in words and totals
    const combinedTableData = [
      ["Estimate Amount in Words", "Total"],
      [amountInWords, `₹${totalAmount.toLocaleString("en-IN")}`],
      // ["Sub Total", `₹${totalAmount.toLocaleString("en-IN")}`],
      // [`₹${totalAmount.toLocaleString("en-IN")}`],
    ];

    autoTable(doc, {
      startY: finalY,
      body: combinedTableData,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: textColor,
        lineColor: borderColor, // #26497a border color
        lineWidth: 0.5,
      },
      columnStyles: {
        0: { cellWidth: (pageWidth - 20) * 0.65, halign: "left" },
        1: { cellWidth: (pageWidth - 20) * 0.38, halign: "right" },
      },
      bodyStyles: {
        0: { fillColor: lightGray, fontStyle: "bold" }, // Header row
        1: { fontStyle: "normal" }, // Amount in words row
        2: { fontStyle: "normal" }, // Sub Total row
        3: { fillColor: lightGray, fontStyle: "bold" }, // Total row
      },
      margin: { left: 10, right: 20 },
    });

    // Bottom section: Bank Details and Terms
    const bottomY = doc.lastAutoTable.finalY + 10;

    // Bank Details (left) and Terms (right)
    const bankDetailsX = 10;
    const termsX = pageWidth / 2 + 5;
    const sectionWidth = (pageWidth - 30) / 2;

    // Bank Details
    addColoredRect(bankDetailsX, bottomY, sectionWidth, 30, lightGray);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Bank Details", bankDetailsX + 2, bottomY + 6);

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

    // Terms and Conditions
    addColoredRect(termsX, bottomY, sectionWidth, 30, lightGray);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Terms and conditions", termsX + 2, bottomY + 6);

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

    // Footer with signature and enhanced styling
    const footerY = bottomY + 95;
    addColoredRect(0, footerY - 5, pageWidth, 25, primaryColor);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    // doc.text("For: Empress PC", 10, footerY + 3);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Authorized Signatory", 10, footerY + 12);

    // // Tech-style decoration in footer
    // doc.setFontSize(12);
    // doc.text("◆", pageWidth / 2 - 30, footerY + 8);
    // doc.text("◆", pageWidth / 2, footerY + 8);
    // doc.text("◆", pageWidth / 2 + 30, footerY + 8);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Generated: ${new Date().toLocaleDateString(
        "en-IN"
      )} ${new Date().toLocaleTimeString("en-IN")}`,
      pageWidth - 10,
      footerY + 8,
      { align: "right" }
    );
    doc.text(
      "Custom PC Solutions & Premium Components",
      pageWidth - 10,
      footerY + 14,
      { align: "right" }
    );

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
