import DailySales from "../models/DailySales.model.js";
import PDFDocument from "pdfkit";
import moment from "moment";
import User from "../models/User.model.js";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import cron from "node-cron";
import { generatePDF } from "../utils/generatePdf.js";

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email from .env
    pass: process.env.EMAIL_PASS, // Your email password from .env (use an App Password if using Gmail)
  },
});

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

export const AdminPerformancepdf = async (req, res) => {
  try {
    const { filter } = req.query;
    let startDate, endDate;

    if (filter === "lastMonth") {
      startDate = moment().subtract(1, "months").startOf("month");
      endDate = moment().subtract(1, "months").endOf("month");
    } else {
      startDate = moment().startOf("month");
      endDate = moment();
    }

    // Fetch sales data
    const salesData = await DailySales.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        },
      },
      {
        $group: {
          _id: "$userId",
          totalSales: { $sum: "$totalSales" },
          totalProfit: { $sum: "$totalProfit" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          username: "$userDetails.username",
          email: "$userDetails.email",
          totalSales: 1,
          totalProfit: 1,
        },
      },
      { $sort: { totalSales: -1 } },
    ]);

    const totalSales = salesData.reduce(
      (sum, user) => sum + user.totalSales,
      0
    );
    const totalProfit = salesData.reduce(
      (sum, user) => sum + user.totalProfit,
      0
    );

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: "A4", layout: "portrait" });
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=admin-performance.pdf"
      );
      res.setHeader("Content-Type", "application/pdf");
      res.send(pdfData);
    });

    // Header
    doc
      .fillColor("#2c3e50")
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("Admin Monthly Performance Report", { align: "center" })
      .moveDown(0.5);

    // Date Range
    doc
      .fillColor("#7f8c8d")
      .fontSize(12)
      .font("Helvetica")
      .text(
        `Date Range: ${startDate.format("YYYY-MM-DD")} to ${endDate.format(
          "YYYY-MM-DD"
        )}`,
        { align: "center" }
      )
      .moveDown(1);

    // Divider
    doc
      .strokeColor("#bdc3c7")
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();

    // Total Sales and Profit
    doc
      .fillColor("#34495e")
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Summary", { align: "center" })
      .moveDown(0.5);

    doc
      .fillColor("#2ecc71")
      .fontSize(14)
      .font("Helvetica")
      .text(`Total Sales: OMN ${totalSales.toLocaleString()}`, {
        align: "center",
      })
      .text(`Total Profit: OMN ${totalProfit.toLocaleString()}`, {
        align: "center",
      })
      .moveDown(1);

    // Leaderboard
    doc
      .fillColor("#34495e")
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("Top Performers", { align: "center", underline: true })
      .moveDown(0.5);

    salesData.forEach((user, index) => {
      if (index === 0) {
        // Highlight the top performer
        doc
          .fillColor("#f1c40f") // Golden color
          .rect(50, doc.y, 500, 25)
          .fill()
          .fillColor("#000000")
          .fontSize(14)
          .font("Helvetica-Bold")
          .text(
            `1st ${user.username} (${
              user.email
            }) - Sales: OMN ${user.totalSales.toLocaleString()}`,
            60,
            doc.y + 5
          );
      } else {
        doc
          .fillColor("#2c3e50")
          .fontSize(12)
          .font("Helvetica")
          .text(
            `${index + 1}. ${user.username} (${
              user.email
            }) - Sales: OMN ${user.totalSales.toLocaleString()}`
          );
      }
      doc.moveDown(0.5);
    });

    // Generate Bar Chart
    const width = 600; // Width of the chart
    const height = 800; // Increased height to accommodate 30 users
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

    const labels = salesData.map((user) => user.username);
    const data = salesData.map((user) => user.totalSales);

    const configuration = {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Total Sales (OMN)",
            data: data,
            backgroundColor: "#2ecc71",
            borderColor: "#27ae60",
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: "y", // Horizontal bars for better readability
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Total Sales (OMN)",
            },
          },
          y: {
            ticks: {
              autoSkip: false, // Ensure all labels are displayed
              font: {
                size: 10, // Smaller font size for y-axis labels
              },
              color: "#2c3e50", // Darker color for better visibility
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
        },
      },
    };

    const chartImage = await chartJSNodeCanvas.renderToBuffer(configuration);

    // Add Chart to PDF
    doc.addPage(); // Add a new page for the chart
    doc.moveDown(2); // Add space before the chart
    doc.text("Sales Performance Chart", { align: "center", underline: true });
    doc.moveDown(0.5);
    doc.image(chartImage, 50, doc.y, { width: 500, align: "center" });

    // Footer
    doc
      .fillColor("#7f8c8d")
      .fontSize(10)
      .font("Helvetica")
      .text(`Generated on: ${moment().format("YYYY-MM-DD HH:mm:ss")}`, {
        align: "center",
      });

    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const sendSalesReport = async () => {
  try {
    // Fetch admin users
    const adminUsers = await User.find({ isAdmin: true }, "email");
    const adminEmails = adminUsers.map((admin) => admin.email);

    if (adminEmails.length === 0) {
      console.log("No admin users found.");
      return;
    }

    // Fetch today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const salesData = await DailySales.find({
      createdAt: { $gte: today },
    }).populate("userId", "username");

    if (salesData.length === 0) {
      console.log("No sales data for today.");
      return;
    }

    // Generate PDF
    const pdfPath = await generatePDF(salesData);

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmails, // Send to all admins
      subject: "Daily Sales Report",
      text: "Attached is today's sales report.",
      attachments: [{ filename: "sales_report.pdf", path: pdfPath }],
    };

    // Send Email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending sales report:", error);
  }
};
