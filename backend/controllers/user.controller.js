import LeaveApplication from "../models/LeaveUser.model.js";
import DailySales from "../models/DailySales.model.js";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import User from "../models/User.model.js";

export const createLeaveApplication = async (req, res) => {
  try {
    const { leaveStartDate, leaveEndDate, leaveType, reason } = req.body;
    const userId = req.user.id;
    const leaveApplication = new LeaveApplication({
      userId,
      leaveStartDate,
      leaveEndDate,
      leaveType,
      reason,
    });

    await leaveApplication.save();
    res.status(201).json({
      message: "Leave application submitted successfully!",
      leaveApplication,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error submitting leave application", error });
  }
};

export const getLeave = async (req, res) => {
  try {
    const userId = req.user.id;

    const latestLeave = await LeaveApplication.findOne({ userId })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!latestLeave) {
      return res.status(404).json({ message: "No leave applications found" });
    }

    res.json(latestLeave);
  } catch (error) {
    console.error("Error fetching leave data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getLeaveApplications = async (req, res) => {
  try {
    // Fetch all leave applications sorted by createdAt in descending order
    const leaveApplications = await LeaveApplication.find()
      .sort({ createdAt: -1 }) // Latest applications first
      .populate("userId", "username email"); // Populate user details

    // Group leave applications by status
    const groupedLeaves = {
      pending: leaveApplications.filter((leave) => leave.status === "Pending"),
      approved: leaveApplications.filter(
        (leave) => leave.status === "Approved"
      ),
      rejected: leaveApplications.filter(
        (leave) => leave.status === "Rejected"
      ),
    };

    res.status(200).json(groupedLeaves);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching leave applications", error });
  }
};

// Update leave application status
export const updateLeaveApplication = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Validate the status
    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Find and update the leave application
    const updatedLeave = await LeaveApplication.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("userId", "username email");

    if (!updatedLeave) {
      return res.status(404).json({ message: "Leave application not found" });
    }

    res.status(200).json(updatedLeave);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating leave application", error });
  }
};

export const downloadSalesUserExcel = async (req, res) => {
  try {
    const saleId = req.params.saleId;
    const sale = await DailySales.findById(saleId).populate("customers");
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!sale) {
      return res.status(404).json({ message: "Sales data not found" });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales Report");

    // Add email at the top
    worksheet.addRow(["Email:", user.email]);
    worksheet.addRow([]); // Empty row for spacing

    // Sales data header
    worksheet.addRow([
      "Date & Time",
      "Total Expense",
      "Total Sales",
      "Total Profit",
    ]);
    worksheet.addRow([
      new Date(sale.createdAt).toLocaleString(),
      sale.totalExpense,
      sale.totalSales,
      sale.totalProfit,
    ]);

    worksheet.addRow([]); // Empty row for spacing

    // Customer details header
    if (sale.customers.length > 0) {
      worksheet.addRow([
        "File",
        "Name",
        "Description",
        "Sales",
        "Profit",
        "Credit",
        "Expense",
        "VAT",
        "Parts",
      ]);

      sale.customers.forEach((customer) => {
        worksheet.addRow([
          customer.file,
          customer.name,
          customer.description || "-",
          customer.sales,
          customer.profit,
          customer.credit,
          customer.expense,
          customer.vat,
          customer.parts,
        ]);
      });
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="sales_data_${saleId}.xlsx"`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating Excel:", error);
    res.status(500).json({ message: "Error generating file" });
  }
};

export const downloadSalesUserPDF = async (req, res) => {
  try {
    const saleId = req.params.saleId;
    const sale = await DailySales.findById(saleId).populate("customers");
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!sale) {
      return res.status(404).json({ message: "Sales data not found" });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const doc = new jsPDF();

    // Add User Details at the Top
    doc.setFontSize(14);
    doc.text(`Sales Report of: ${user.username}`, 14, 10);
    doc.setFontSize(12);
    doc.text(`Email: ${user.email}`, 14, 20);

    // Sales Data Table
    doc.autoTable({
      startY: 30, // Adjust to position below the user details
      head: [["Date & Time", "Total Expense", "Total Sales", "Total Profit"]],
      body: [
        [
          new Date(sale.createdAt).toLocaleString(),
          `OMR ${sale.totalExpense}`,
          `OMR ${sale.totalSales}`,
          `OMR ${sale.totalProfit}`,
        ],
      ],
    });

    // Customer Data Table
    if (sale.customers.length > 0) {
      doc.text("Customer Details", 14, doc.lastAutoTable.finalY + 10); // Adjust position

      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [
          [
            "Name",
            "Description",
            "Sales",
            "Profit",
            "Credit",
            "Expense",
            "VAT",
            "Parts Amount",
          ],
        ],
        body: sale.customers.map((customer) => [
          customer.name,
          customer.description,
          `OMR ${customer.sales}`,
          `OMR ${customer.profit}`,
          `OMR ${customer.credit}`,
          `OMR ${customer.expense}`,
          `OMR ${customer.vat}`,
          `OMR ${customer.parts}`,
        ]),
      });
    }

    // Send as a downloadable PDF
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="sales_report_${saleId}.pdf"`
    );
    res.setHeader("Content-Type", "application/pdf");

    const pdfBuffer = doc.output("arraybuffer");
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Error generating file" });
  }
};
