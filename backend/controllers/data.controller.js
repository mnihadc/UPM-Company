import DailySales from "../models/DailySales.model.js";
import PDFDocument from "pdfkit";

export const userPerformance = async (req, res) => {
  try {
    const { filter, userId: queryUserId } = req.query;
    const tokenUserId = req.user.id; // Extract user ID from token

    // Determine which user ID to use (admin can pass userId, otherwise use token userId)
    const userId = queryUserId || tokenUserId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    let startDate, endDate;
    if (filter === "thisMonth") {
      startDate = startOfMonth;
      endDate = today;
    } else if (filter === "lastMonth") {
      startDate = startOfLastMonth;
      endDate = endOfLastMonth;
    }

    const salesData = await DailySales.find({
      userId: userId,
      createdAt: { $gte: startDate, $lte: endDate },
    }).populate("userId", "username email");

    let totalSales = 0;
    let totalProfit = 0;
    let totalCredit = 0;
    let totalExpense = 0;

    salesData.forEach((entry) => {
      totalSales += entry.totalSales;
      totalProfit += entry.totalProfit;
      totalExpense += entry.totalExpense;
      entry.customers.forEach((customer) => {
        totalCredit += customer.credit || 0;
      });
    });

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=user_performance_${userId}.pdf`
    );
    doc.pipe(res);

    // Add Header
    doc
      .fillColor("#333333")
      .fontSize(24)
      .text("User Performance Report", { align: "center", underline: true })
      .moveDown(0.5);

    const monthName = today.toLocaleString("default", { month: "long" });
    const year = today.getFullYear();
    const formattedDate = today.toLocaleDateString();

    let filterText;
    if (filter === "thisMonth") {
      filterText = `This Month (${monthName} ${year}) up to ${formattedDate}`;
    } else if (filter === "lastMonth") {
      const lastMonthName = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      ).toLocaleString("default", { month: "long" });
      filterText = `Last Month (${lastMonthName} ${year})`;
    }

    doc
      .fontSize(12)
      .fillColor("#555555")
      .text(`Filter: ${filterText}`, { align: "center" })
      .moveDown(1);

    // Add user details section
    if (salesData.length > 0) {
      const user = salesData[0].userId;
      doc
        .fontSize(14)
        .fillColor("#007BFF")
        .text("User Details:", { underline: true })
        .moveDown(0.5);
      doc
        .fontSize(12)
        .fillColor("#333333")
        .text(`Username: ${user.username}`)
        .text(`Email: ${user.email}`)
        .moveDown(1);
    }

    // Summary Section
    doc
      .fontSize(14)
      .fillColor("#007BFF")
      .text("Summary:", { underline: true })
      .moveDown(0.5);

    const drawBox = (x, y, label, value) => {
      doc.rect(x, y, 120, 60).fill("#E3F2FD").stroke("#007BFF");
      doc
        .fontSize(12)
        .fillColor("#007BFF")
        .text(label, x + 10, y + 10, { width: 100, align: "center" });
      doc
        .fontSize(14)
        .fillColor("#333333")
        .text(value, x + 10, y + 30, { width: 100, align: "center" });
    };

    const startX = 50,
      startY = doc.y;
    drawBox(startX, startY, "Total Sales", `OMN ${totalSales.toFixed(2)}`);
    drawBox(
      startX + 140,
      startY,
      "Total Profit",
      `OMN ${totalProfit.toFixed(2)}`
    );
    drawBox(
      startX + 280,
      startY,
      "Total Credit",
      `OMN ${totalCredit.toFixed(2)}`
    );
    drawBox(
      startX + 420,
      startY,
      "Total Expense",
      `OMN ${totalExpense.toFixed(2)}`
    );

    doc.moveDown(2);
    doc
      .fillColor("#333333")
      .fontSize(14)
      .text("Customer Data", { align: "center", underline: true })
      .moveDown(0.5);

    const headers = [
      "Date",
      "File",
      "Name",
      "Sales",
      "Profit",
      "Credit",
      "Expense",
      "VAT",
      "Parts",
    ];
    const columnWidths = [60, 40, 80, 50, 50, 50, 50, 40, 40];

    let x = 50,
      y = doc.y;
    doc.lineWidth(1).strokeColor("#007BFF");

    // Table Headers
    headers.forEach((header, i) => {
      doc.rect(x, y, columnWidths[i], 20).fill("#007BFF").stroke("#007BFF");
      doc
        .fontSize(12)
        .fillColor("#FFFFFF")
        .text(header, x + 5, y + 5, { width: columnWidths[i], align: "left" });
      x += columnWidths[i];
    });

    y += 20;

    const allCustomers = salesData
      .flatMap((entry) =>
        entry.customers.map((customer) => ({
          ...customer.toObject(),
          createdAt: entry.createdAt,
        }))
      )
      .sort((a, b) => a.createdAt - b.createdAt);

    // Table Rows
    allCustomers.forEach((customer, index) => {
      x = 50;
      const rowHeight = 20;

      if (index % 2 === 0) {
        doc.rect(x, y, 520, rowHeight).fill("#F5F5F5").stroke("#E0E0E0");
      }

      const rowData = [
        customer.createdAt?.toLocaleDateString() || "-",
        customer.file?.toString() || "-",
        customer.name || "-",
        `${customer.sales?.toFixed(2) || "0.00"}`,
        `${customer.profit?.toFixed(2) || "0.00"}`,
        `${customer.credit?.toFixed(2) || "0.00"}`,
        `${customer.expense?.toFixed(2) || "0.00"}`,
        `${customer.vat?.toFixed(2) || "0.00"}`,
        customer.parts?.toString() || "-",
      ];

      rowData.forEach((data, i) => {
        doc
          .fontSize(10)
          .fillColor("#333333")
          .text(data, x + 5, y + 5, {
            width: columnWidths[i] - 10,
            align: "left",
            lineBreak: false,
          });
        doc.rect(x, y, columnWidths[i], rowHeight).stroke("#E0E0E0");
        x += columnWidths[i];
      });

      y += rowHeight;
    });

    // Footer
    const downloadedDate = new Date().toLocaleDateString();
    doc
      .fontSize(10)
      .fillColor("#777777")
      .text(`Downloaded on: ${downloadedDate}`, 50, doc.page.height - 50, {
        align: "center",
      });

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  }
};
