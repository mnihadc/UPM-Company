import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generatePDF = async (salesData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 30, size: "A4" });
      const pdfPath = path.join("sales_report.pdf");
      const writeStream = fs.createWriteStream(pdfPath);
      doc.pipe(writeStream);

      doc
        .font("Helvetica-Bold")
        .fontSize(20)
        .fillColor("#2c3e50")
        .text("Daily Sales Report", { align: "center" })
        .moveDown(0.5);

      const today = new Date().toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      doc
        .fontSize(10)
        .fillColor("#7f8c8d")
        .text(`Date: ${today}`, { align: "center" })
        .moveDown(0.5);

      let topSalesman = null;
      const totalSales = salesData.reduce((acc, sale) => {
        if (!topSalesman || sale.totalSales > topSalesman.totalSales) {
          topSalesman = sale;
        }
        return acc + sale.totalSales;
      }, 0);

      const totalExpense = salesData.reduce(
        (acc, sale) => acc + sale.totalExpense,
        0
      );
      const totalProfit = totalSales - totalExpense;
      const totalCredits = salesData.reduce(
        (acc, sale) => acc + (sale.totalCredit || 0),
        0
      );

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor("#34495e")
        .text(`Total Sales: ${totalSales.toFixed(2)}`)
        .text(`Total Expense: ${totalExpense.toFixed(2)}`)
        .text(`Total Profit: ${totalProfit.toFixed(2)}`)
        .moveDown(0.5);

      if (topSalesman) {
        doc
          .fillColor("#27ae60")
          .text(
            `Top Salesman: ${
              topSalesman.userId.username
            } - Sales: ${topSalesman.totalSales.toFixed(2)}`
          )
          .moveDown(0.5);
      }

      const columns = [
        "Username",
        "File",
        "Name",
        "Sales",
        "Profit",
        "Credit",
        "Expense",
        "VAT",
        "Parts",
      ];
      const columnWidths = [80, 35, 90, 55, 55, 55, 55, 40, 40];
      const startX = 30;
      let startY = doc.y;
      const rowHeight = 18;

      doc.fill("#3498db").rect(startX, startY, 505, rowHeight).fill();
      doc.fillColor("#fff").fontSize(8).font("Helvetica-Bold");

      let xPosition = startX;
      columns.forEach((col, index) => {
        doc.text(col, xPosition + 3, startY + 5, {
          width: columnWidths[index],
          align: "center",
        });
        xPosition += columnWidths[index];
      });

      startY += rowHeight;
      doc.fillColor("#000").font("Helvetica").fontSize(7);

      salesData.forEach((sale) => {
        sale.customers.forEach((customer) => {
          if (startY + rowHeight > 750) {
            doc.addPage();
            startY = 50;

            doc.fill("#3498db").rect(startX, startY, 505, rowHeight).fill();
            doc.fillColor("#fff").fontSize(8).font("Helvetica-Bold");

            let xNew = startX;
            columns.forEach((col, index) => {
              doc.text(col, xNew + 3, startY + 5, {
                width: columnWidths[index],
                align: "center",
              });
              xNew += columnWidths[index];
            });

            startY += rowHeight;
            doc.fillColor("#000").font("Helvetica").fontSize(7);
          }

          xPosition = startX;
          doc.rect(startX, startY, 505, rowHeight).stroke();
          doc.text(sale.userId.username, xPosition + 3, startY + 5, {
            width: columnWidths[0],
            align: "center",
          });
          xPosition += columnWidths[0];

          doc.text(customer.file.toString(), xPosition + 3, startY + 5, {
            width: columnWidths[1],
            align: "center",
          });
          xPosition += columnWidths[1];

          doc.text(customer.name, xPosition + 3, startY + 5, {
            width: columnWidths[2],
            align: "center",
          });
          xPosition += columnWidths[2];

          doc.text(customer.sales.toFixed(2), xPosition + 3, startY + 5, {
            width: columnWidths[3],
            align: "center",
          });
          xPosition += columnWidths[3];

          doc.text(customer.profit.toFixed(2), xPosition + 3, startY + 5, {
            width: columnWidths[4],
            align: "center",
          });
          xPosition += columnWidths[4];

          doc.text(customer.credit.toFixed(2), xPosition + 3, startY + 5, {
            width: columnWidths[5],
            align: "center",
          });
          xPosition += columnWidths[5];

          doc.text(customer.expense.toFixed(2), xPosition + 3, startY + 5, {
            width: columnWidths[6],
            align: "center",
          });
          xPosition += columnWidths[6];

          doc.text(customer.vat.toFixed(2), xPosition + 3, startY + 5, {
            width: columnWidths[7],
            align: "center",
          });
          xPosition += columnWidths[7];

          doc.text(customer.parts.toFixed(2), xPosition + 3, startY + 5, {
            width: columnWidths[8],
            align: "center",
          });

          startY += rowHeight;
        });
      });

      doc.end();
      writeStream.on("finish", () => resolve(pdfPath));
    } catch (error) {
      reject(error);
    }
  });
};
