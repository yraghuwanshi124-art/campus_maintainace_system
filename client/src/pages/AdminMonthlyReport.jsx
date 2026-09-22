
import { useEffect, useState } from "react";
import api from "../services/api";
import AdminSidebar from "../components/AdminSidebar";
import LogoutModal from "../components/LogoutModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function AdminMonthlyReport() {
  const [complaints, setComplaints] = useState([]);
  const [showLogout, setShowLogout] = useState(false);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/complaints/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setComplaints(response.data.complaints || []);
    } catch (error) {
      console.log("Failed to fetch complaints:", error);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyComplaints = complaints.filter((complaint) => {
    if (!complaint.createdAt) return false;

    const date = new Date(complaint.createdAt);

    return (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    );
  });

  const monthlyTotal = monthlyComplaints.length;

  const monthlyResolved = monthlyComplaints.filter(
    (c) => c.status === "Resolved"
  ).length;

  const monthlyPending = monthlyComplaints.filter(
    (c) => c.status === "Pending"
  ).length;

  const monthlyAssigned = monthlyComplaints.filter(
    (c) => c.status === "Assigned"
  ).length;

  const monthlyInProgress = monthlyComplaints.filter(
    (c) => c.status === "In Progress"
  ).length;

  const activeComplaints =
    monthlyPending + monthlyAssigned + monthlyInProgress;

  const currentMonthName = now.toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Resolved":
        return [22, 101, 52];

      case "In Progress":
        return [109, 40, 217];

      case "Assigned":
        return [194, 65, 12];

      case "Pending":
        return [30, 64, 175];

      default:
        return [71, 85, 105];
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return [185, 28, 28];

      case "Medium":
        return [180, 83, 9];

      case "Low":
        return [21, 128, 61];

      default:
        return [71, 85, 105];
    }
  };

  const drawHeader = (doc, pageNumber) => {
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, 15, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("MEDI-CAPS UNIVERSITY", 14, 9);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("CAMPUSFIX  •  CAMPUS MAINTENANCE MANAGEMENT SYSTEM", 14, 12.5);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    doc.text(`Page ${pageNumber}`, pageWidth - 14, 10, {
      align: "right",
    });
  };

  const drawFooter = (doc) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);

    doc.text(
      "Official CampusFix Administration Report",
      14,
      pageHeight - 6
    );

    doc.text(
      "Generated automatically",
      pageWidth - 14,
      pageHeight - 6,
      {
        align: "right",
      }
    );
  };

  const downloadMonthlyPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    /*
     * ------------------------------------------------
     * PAGE 1 — EXECUTIVE SUMMARY
     * ------------------------------------------------
     */

    drawHeader(doc, 1);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);

    doc.text("Monthly Maintenance Report", 14, 29);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);

    doc.text(currentMonthName, 14, 36);

    doc.setFontSize(8);
    doc.text(
      `Generated on ${formatDateTime(now)}`,
      pageWidth - 14,
      36,
      {
        align: "right",
      }
    );

    /*
     * Report Information
     */

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);

    doc.roundedRect(14, 44, pageWidth - 28, 22, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);

    doc.text("REPORT TYPE", 20, 51);
    doc.text("REPORTING PERIOD", 78, 51);
    doc.text("TOTAL RECORDS", 150, 51);
    doc.text("RESOLVED", 218, 51);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);

    doc.text("Monthly Summary", 20, 59);
    doc.text(currentMonthName, 78, 59);
    doc.text(String(monthlyTotal), 150, 59);
    doc.setTextColor(22, 101, 52);
    doc.text(String(monthlyResolved), 218, 59);

    /*
     * KPI CARDS
     */

    const cardY = 73;
    const cardWidth = 59;
    const cardHeight = 30;
    const gap = 5;

    const cards = [
      {
        label: "TOTAL COMPLAINTS",
        value: monthlyTotal,
        color: [30, 41, 59],
      },
      {
        label: "RESOLVED",
        value: monthlyResolved,
        color: [22, 101, 52],
      },
      {
        label: "ACTIVE",
        value: activeComplaints,
        color: [194, 65, 12],
      },
      {
        label: "PENDING",
        value: monthlyPending,
        color: [30, 64, 175],
      },
    ];

    cards.forEach((card, index) => {
      const x = 14 + index * (cardWidth + gap);

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, cardY, cardWidth, cardHeight, 3, 3, "FD");

      doc.setFillColor(...card.color);
      doc.roundedRect(x, cardY, 3, cardHeight, 1.5, 1.5, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);

      doc.text(card.label, x + 9, cardY + 9);

      doc.setFontSize(18);
      doc.setTextColor(...card.color);

      doc.text(String(card.value), x + 9, cardY + 23);
    });

    /*
     * Complaint Overview
     */

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);

    doc.text("Complaint Overview", 14, 119);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);

    const summaryText =
      monthlyTotal === 0
        ? "No complaints were recorded during the selected reporting period."
        : `A total of ${monthlyTotal} complaint${
            monthlyTotal === 1 ? "" : "s"
          } were recorded during ${currentMonthName}. ${monthlyResolved} ${
            monthlyResolved === 1 ? "complaint has" : "complaints have"
          } been resolved, while ${activeComplaints} ${
            activeComplaints === 1 ? "complaint remains" : "complaints remain"
          } under active processing.`;

    const summaryLines = doc.splitTextToSize(
      summaryText,
      pageWidth - 28
    );

    doc.text(summaryLines, 14, 127);

    /*
     * Status Summary
     */

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);

    doc.text("Status Summary", 14, 145);

    autoTable(doc, {
      startY: 150,
      margin: {
        left: 14,
        right: 14,
      },
      tableWidth: pageWidth - 28,

      head: [
        [
          "Status",
          "Complaints",
          "Share of Monthly Records",
        ],
      ],

      body: [
        [
          "Pending",
          monthlyPending,
          monthlyTotal
            ? `${((monthlyPending / monthlyTotal) * 100).toFixed(1)}%`
            : "0%",
        ],
        [
          "Assigned",
          monthlyAssigned,
          monthlyTotal
            ? `${((monthlyAssigned / monthlyTotal) * 100).toFixed(1)}%`
            : "0%",
        ],
        [
          "In Progress",
          monthlyInProgress,
          monthlyTotal
            ? `${((monthlyInProgress / monthlyTotal) * 100).toFixed(1)}%`
            : "0%",
        ],
        [
          "Resolved",
          monthlyResolved,
          monthlyTotal
            ? `${((monthlyResolved / monthlyTotal) * 100).toFixed(1)}%`
            : "0%",
        ],
      ],

      theme: "plain",

      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 5,
        textColor: [51, 65, 85],
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
      },

      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [51, 65, 85],
        fontStyle: "bold",
        fontSize: 7.5,
      },

      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },

      columnStyles: {
        0: {
          cellWidth: 80,
          fontStyle: "bold",
        },
        1: {
          cellWidth: 50,
          halign: "center",
        },
        2: {
          halign: "center",
        },
      },
    });

    /*
     * Category Overview
     */

    const categoryMap = {};

    monthlyComplaints.forEach((complaint) => {
      const category = complaint.category || "Other";

      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }

      categoryMap[category]++;
    });

    const categoryRows = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([category, count]) => [
        category,
        count,
        monthlyTotal
          ? `${((count / monthlyTotal) * 100).toFixed(1)}%`
          : "0%",
      ]);

    if (categoryRows.length > 0) {
      const categoryStart =
        doc.lastAutoTable.finalY + 9;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);

      doc.text("Complaint Categories", 14, categoryStart);

      autoTable(doc, {
        startY: categoryStart + 5,
        margin: {
          left: 14,
          right: 14,
        },

        head: [
          [
            "Category",
            "Complaints",
            "Share",
          ],
        ],

        body: categoryRows,

        theme: "plain",

        styles: {
          font: "helvetica",
          fontSize: 8,
          cellPadding: 4,
          textColor: [51, 65, 85],
          lineColor: [226, 232, 240],
          lineWidth: 0.2,
        },

        headStyles: {
          fillColor: [241, 245, 249],
          textColor: [51, 65, 85],
          fontStyle: "bold",
          fontSize: 7.5,
        },

        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },

        columnStyles: {
          0: {
            cellWidth: 100,
            fontStyle: "bold",
          },
          1: {
            cellWidth: 55,
            halign: "center",
          },
          2: {
            halign: "center",
          },
        },
      });
    }

    drawFooter(doc);

    /*
     * ------------------------------------------------
     * PAGE 2 — DETAILED COMPLAINT REGISTER
     * ------------------------------------------------
     */

    doc.addPage();

    drawHeader(doc, 2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.setTextColor(15, 23, 42);

    doc.text("Detailed Complaint Register", 14, 29);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);

    doc.text(
      `${monthlyTotal} complaint${
        monthlyTotal === 1 ? "" : "s"
      } recorded during ${currentMonthName}`,
      14,
      35
    );

    /*
     * Detailed Table
     */

    if (monthlyComplaints.length === 0) {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);

      doc.roundedRect(
        14,
        50,
        pageWidth - 28,
        35,
        3,
        3,
        "FD"
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105);

      doc.text(
        "No complaints found for this reporting period.",
        pageWidth / 2,
        69,
        {
          align: "center",
        }
      );
    } else {
      const tableData = monthlyComplaints.map(
        (complaint, index) => [
          index + 1,
          complaint.category || "—",
          `${complaint.block || "—"}${
            complaint.room
              ? ` / Room ${complaint.room}`
              : ""
          }`,
          complaint.user?.name || "—",
          complaint.status || "—",
          complaint.priority || "—",
          formatDate(complaint.createdAt),
          formatDate(complaint.assignedAt),
          formatDate(complaint.resolvedAt),
        ]
      );

      autoTable(doc, {
        startY: 43,

        margin: {
          top: 22,
          left: 10,
          right: 10,
          bottom: 18,
        },

        head: [
          [
            "#",
            "Category",
            "Location",
            "Reported By",
            "Status",
            "Priority",
            "Raised",
            "Assigned",
            "Resolved",
          ],
        ],

        body: tableData,

        theme: "grid",

        styles: {
          font: "helvetica",
          fontSize: 7,
          cellPadding: 3.5,
          valign: "middle",
          textColor: [51, 65, 85],
          lineColor: [226, 232, 240],
          lineWidth: 0.15,
        },

        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 7,
          halign: "center",
          cellPadding: 4,
        },

        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },

        columnStyles: {
          0: {
            cellWidth: 9,
            halign: "center",
          },

          1: {
            cellWidth: 25,
            fontStyle: "bold",
          },

          2: {
            cellWidth: 39,
          },

          3: {
            cellWidth: 35,
          },

          4: {
            cellWidth: 29,
            halign: "center",
          },

          5: {
            cellWidth: 22,
            halign: "center",
          },

          6: {
            cellWidth: 26,
            halign: "center",
          },

          7: {
            cellWidth: 26,
            halign: "center",
          },

          8: {
            cellWidth: 26,
            halign: "center",
          },
        },

        didParseCell: (data) => {
          if (data.section !== "body") return;

          const column = data.column.index;
          const value = data.cell.raw;

          /*
           * Status
           */

          if (column === 4) {
            const color = getStatusColor(value);

            data.cell.styles.textColor = color;
            data.cell.styles.fontStyle = "bold";
          }

          /*
           * Priority
           */

          if (column === 5) {
            const color = getPriorityColor(value);

            data.cell.styles.textColor = color;
            data.cell.styles.fontStyle = "bold";
          }

          /*
           * Serial Number
           */

          if (column === 0) {
            data.cell.styles.textColor = [100, 116, 139];
          }
        },

        didDrawPage: (data) => {
          const pageNumber =
            doc.internal.getNumberOfPages();

          drawHeader(doc, pageNumber);
          drawFooter(doc);
        },
      });
    }

    /*
     * ------------------------------------------------
     * REPORT NOTE
     * ------------------------------------------------
     */

    let finalY = doc.lastAutoTable
      ? doc.lastAutoTable.finalY
      : 90;

    /*
     * If the table is very long, place the note on
     * the last page with enough spacing.
     */

    if (finalY > pageHeight - 35) {
      doc.addPage();

      const newPageNumber =
        doc.internal.getNumberOfPages();

      drawHeader(doc, newPageNumber);

      finalY = 35;
    }

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);

    doc.roundedRect(
      14,
      finalY + 10,
      pageWidth - 28,
      20,
      3,
      3,
      "FD"
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);

    doc.text("REPORT NOTE", 20, finalY + 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    doc.text(
      "This report contains complaint records generated through the CampusFix campus maintenance system.",
      20,
      finalY + 24
    );

    drawFooter(doc);

    /*
     * ------------------------------------------------
     * SAVE PDF
     * ------------------------------------------------
     */

    const safeMonthName = currentMonthName
      .replace(/\s+/g, "_")
      .replace(/,/g, "");

    doc.save(
      `CampusFix_Monthly_Maintenance_Report_${safeMonthName}.pdf`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar onLogout={() => setShowLogout(true)} />

      <div className="lg:ml-64">
        <header className="border-b border-slate-200 bg-white px-6 py-5">
          <h1 className="text-2xl font-black text-slate-800">
            Monthly Reports
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Complaint summary for {currentMonthName}
          </p>
        </header>

        <main className="p-6">
          <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Monthly Summary
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-800">
                {currentMonthName}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review complaint activity and download the
                official administration report.
              </p>
            </div>

            <button
              onClick={downloadMonthlyPDF}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              ↓ Download Professional PDF
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Total
              </p>

              <h3 className="mt-2 text-3xl font-black text-slate-800">
                {monthlyTotal}
              </h3>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Resolved
              </p>

              <h3 className="mt-2 text-3xl font-black text-emerald-600">
                {monthlyResolved}
              </h3>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Pending
              </p>

              <h3 className="mt-2 text-3xl font-black text-blue-600">
                {monthlyPending}
              </h3>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Assigned
              </p>

              <h3 className="mt-2 text-3xl font-black text-orange-600">
                {monthlyAssigned}
              </h3>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                In Progress
              </p>

              <h3 className="mt-2 text-3xl font-black text-purple-600">
                {monthlyInProgress}
              </h3>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-black text-slate-800">
                  Monthly Complaints
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {monthlyComplaints.length} complaints
                  created this month
                </p>
              </div>

              <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
                {currentMonthName}
              </div>
            </div>

            {monthlyComplaints.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                No complaints found for this month.
              </div>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
                      <th className="px-4 py-3">
                        Category
                      </th>

                      <th className="px-4 py-3">
                        Location
                      </th>

                      <th className="px-4 py-3">
                        Student
                      </th>

                      <th className="px-4 py-3">
                        Status
                      </th>

                      <th className="px-4 py-3">
                        Priority
                      </th>

                      <th className="px-4 py-3">
                        Created
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {monthlyComplaints.map((complaint) => (
                      <tr
                        key={complaint._id}
                        className="border-b border-slate-100"
                      >
                        <td className="px-4 py-4 font-semibold text-slate-700">
                          {complaint.category || "—"}
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-600">
                          {complaint.block || "—"}{" "}
                          {complaint.room
                            ? `- Room ${complaint.room}`
                            : ""}
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-600">
                          {complaint.user?.name || "—"}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              complaint.status ===
                              "Resolved"
                                ? "bg-emerald-50 text-emerald-700"
                                : complaint.status ===
                                  "In Progress"
                                ? "bg-purple-50 text-purple-700"
                                : complaint.status ===
                                  "Assigned"
                                ? "bg-orange-50 text-orange-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {complaint.status || "—"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`text-sm font-semibold ${
                              complaint.priority === "High"
                                ? "text-red-600"
                                : complaint.priority ===
                                  "Medium"
                                ? "text-orange-600"
                                : "text-emerald-600"
                            }`}
                          >
                            {complaint.priority || "—"}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-500">
                          {formatDate(complaint.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      <LogoutModal
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
      />
    </div>
  );
}

export default AdminMonthlyReport;
