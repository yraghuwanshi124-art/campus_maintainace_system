const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
console.log("ADMIN_EMAIL:", process.env.ADMIN_EMAIL);

const sendComplaintNotification = async (complaint) => {
  try {
    await transporter.sendMail({
      from: `"CampusFix" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "New Maintenance Complaint - CampusFix",

      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>New Maintenance Complaint</h2>

          <p>A new complaint has been submitted to CampusFix.</p>

          <hr />

          <p><strong>Block:</strong> ${complaint.block}</p>
          <p><strong>Room:</strong> ${complaint.room}</p>
          <p><strong>Category:</strong> ${complaint.category}</p>
          <p><strong>Priority:</strong> ${complaint.priority}</p>

          <p>
            <strong>Description:</strong><br />
            ${complaint.description}
          </p>

          <hr />

          <p>
            Please login to the CampusFix Admin Dashboard
            to view and manage this complaint.
          </p>
        </div>
      `,
    });

    console.log("Complaint notification email sent successfully");
  } catch (error) {
    console.log("Email notification failed:", error.message);
  }
};

const sendTechnicianAssignmentEmail = async (complaint, technician) => {
  try {
    console.log("Technician email:", process.env.TECHNICIAN_EMAIL);
    await transporter.sendMail({
      from: `"CampusFix" <${process.env.EMAIL_USER}>`,
to: process.env.TECHNICIAN_EMAIL,
      subject: "New Complaint Assigned - CampusFix",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 25px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
        ">

          <h2 style="color: #4f46e5;">
            New Complaint Assigned
          </h2>

          <p>Hello <strong>${technician.name}</strong>,</p>

          <p>
            A new maintenance complaint has been assigned to you
            by the administrator.
          </p>

          <hr />

          <p><strong>Block:</strong> ${complaint.block}</p>
          <p><strong>Room:</strong> ${complaint.room}</p>
          <p><strong>Category:</strong> ${complaint.category}</p>
          <p><strong>Priority:</strong> ${complaint.priority}</p>

          <p>
            <strong>Description:</strong><br />
            ${complaint.description}
          </p>

          <hr />

          <a
            href="http://localhost:5173/"
            style="
              display: inline-block;
              padding: 12px 22px;
              background-color: #4f46e5;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
            "
          >
            Go to Technician Login
          </a>

          <p style="margin-top: 25px; color: #6b7280; font-size: 13px;">
            This is an automated notification from CampusFix.
          </p>

        </div>
      `,
    });
    

    console.log("Technician assignment email sent successfully");
  } catch (error) {
    console.log(
      "Technician email notification failed:",
      error.message
    );
  }
};
const sendComplaintResolvedEmail = async (complaint) => {
  try {
    await transporter.sendMail({
      from: `"CampusFix" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "Complaint Resolved - CampusFix",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 25px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
        ">

          <h2 style="color: #059669;">
            Complaint Resolved ✅
          </h2>

          <p>
            A technician has marked the following maintenance
            complaint as <strong>Resolved</strong>.
          </p>

          <hr />

          <p><strong>Block:</strong> ${complaint.block}</p>
          <p><strong>Room:</strong> ${complaint.room}</p>
          <p><strong>Category:</strong> ${complaint.category}</p>
          <p><strong>Priority:</strong> ${complaint.priority}</p>

          <p>
            <strong>Description:</strong><br />
            ${complaint.description}
          </p>

          <hr />

          <p>
            Please login to the CampusFix Admin Dashboard
            to verify the completed work.
          </p>

          <p style="
            margin-top: 25px;
            color: #6b7280;
            font-size: 13px;
          ">
            This is an automated notification from CampusFix.
          </p>

        </div>
      `,
    });

    console.log("Complaint resolved email sent successfully");

  } catch (error) {
    console.log(
      "Resolved complaint email failed:",
      error.message
    );
  }
};

module.exports = {
  sendComplaintNotification,
  sendTechnicianAssignmentEmail,
  sendComplaintResolvedEmail,
};
