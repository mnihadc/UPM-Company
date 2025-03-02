import DailySales from "../models/DailySales.model.js";
import PDFDocument from "pdfkit";

export const userPerformance = async (req, res) => {
  try {
    const { filter } = req.query;
    const userId = req.user.id; // Get the user ID from the authenticated request

    // Calculate date range based on filter
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

    // Fetch data from MongoDB for the specific user
    const salesData = await DailySales.find({
      userId: userId, // Filter by the authenticated user's ID
      createdAt: { $gte: startDate, $lte: endDate },
    }).populate("userId", "username email");

    // Calculate total sales, profit, credit, and expense
    let totalSales = 0;
    let totalProfit = 0;
    let totalCredit = 0;
    let totalExpense = 0;

    salesData.forEach((entry) => {
      totalSales += entry.totalSales;
      totalProfit += entry.totalProfit;
      totalExpense += entry.totalExpense;
      entry.customers.forEach((customer) => {
        totalCredit += customer.credit;
      });
    });

    // Generate PDF
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=user_performance_${userId}.pdf`
    );
    doc.pipe(res);

    // Add a stylish header
    doc
      .fillColor("#333333") // Dark gray color
      .fontSize(24)
      .text("User Performance Report", { align: "center", underline: true })
      .moveDown(1);

    // Add filter information
    const monthName = today.toLocaleString("default", { month: "long" }); // Full month name (e.g., "October")
    const year = today.getFullYear(); // Current year
    const formattedDate = today.toLocaleDateString(); // Formatted date (e.g., "10/15/2023")

    let filterText;
    if (filter === "thisMonth") {
      filterText = `This Month (${monthName} ${year}) up to ${formattedDate}`;
    } else if (filter === "lastMonth") {
      const lastMonthName = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      ).toLocaleString("default", { month: "long" }); // Last month's name
      filterText = `Last Month (${lastMonthName} ${year})`;
    }

    doc
      .fontSize(14)
      .fillColor("#555555") // Gray color
      .text(`Filter: ${filterText}`, { align: "left" })
      .moveDown(1);

    // Display user details
    if (salesData.length > 0) {
      const user = salesData[0].userId;
      doc
        .fontSize(16)
        .fillColor("#007BFF") // Blue color
        .text("User Details:", { underline: true })
        .moveDown(0.5);
      doc
        .fontSize(12)
        .fillColor("#333333") // Dark gray color
        .text(`Username: ${user.username}`)
        .text(`Email: ${user.email}`)
        .moveDown(1);
    }

    // Display summary in styled boxes
    doc
      .fontSize(16)
      .fillColor("#007BFF") // Blue color
      .text("Summary:", { underline: true })
      .moveDown(0.5);

    const boxWidth = 120; // Width of each box
    const boxHeight = 60; // Height of each box
    const boxMargin = 20; // Margin between boxes
    const startX = 50; // Starting X position
    const startY = doc.y; // Starting Y position

    // Function to draw a styled box
    const drawBox = (x, y, label, value) => {
      doc.rect(x, y, boxWidth, boxHeight).fill("#E3F2FD"); // Light blue background color

      doc
        .fontSize(12)
        .fillColor("#007BFF") // Blue color for label
        .text(label, x + 10, y + 10, { width: boxWidth - 20, align: "center" });

      doc
        .fontSize(14)
        .fillColor("#333333") // Dark gray color for value
        .text(value, x + 10, y + 30, { width: boxWidth - 20, align: "center" });
    };

    // Draw boxes for total sales, profit, credit, and expense
    drawBox(startX, startY, "Total Sales", `OMN ${totalSales.toFixed(2)}`);
    drawBox(
      startX + boxWidth + boxMargin,
      startY,
      "Total Profit",
      `OMN ${totalProfit.toFixed(2)}`
    );
    drawBox(
      startX + 2 * (boxWidth + boxMargin),
      startY,
      "Total Credit",
      `OMN ${totalCredit.toFixed(2)}`
    );
    drawBox(
      startX + 3 * (boxWidth + boxMargin),
      startY,
      "Total Expense",
      `OMN ${totalExpense.toFixed(2)}`
    );

    // Move down after the boxes
    doc.moveDown(2);

    // Add a footer
    doc
      .fontSize(10)
      .fillColor("#777777") // Light gray color
      .text(`Report generated on: ${formattedDate}`, { align: "center" });

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
};
