const nodemailer = require("nodemailer");

function clean(value, max = 5000) {
  return String(value ?? "").trim().slice(0, max);
}

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method not allowed." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});

    // Basic honeypot support.
    if (clean(body.website, 200)) {
      return json(res, 200, { message: "Thank you. Your message has been received." });
    }

    const name = clean(body.name, 120);
    const email = clean(body.email, 254);
    const company = clean(body.company, 160);
    const phone = clean(body.phone, 80);
    const service = clean(body.service, 160);
    const subject = clean(body.subject, 200) || "General Inquiry";
    const message = clean(body.message, 5000);

    if (!name || !email || !message) {
      return json(res, 400, { error: "Name, email and message are required." });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return json(res, 400, { error: "Please enter a valid email address." });
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || user;
    const to = process.env.CONTACT_TO || "info@starleaftechnologies.com";
    const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "ssl";

    if (!host || !user || !pass || !from) {
      console.error("SMTP environment variables are not configured.");
      return json(res, 500, { error: "Email service is not configured yet. Please try again later." });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass }
    });

    const text = [
      "STARLEAF TECHNOLOGIES — CONTACT FORM",
      "====================================",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "Not provided"}`,
      `Company: ${company || "Not provided"}`,
      `Service: ${service || "Not specified"}`,
      `Subject: ${subject}`,
      "",
      "MESSAGE",
      "-------",
      message,
      "",
      `Submitted: ${new Date().toISOString()}`
    ].join("\n");

    await transporter.sendMail({
      from,
      to,
      replyTo: email,
      subject: `New Contact Form Submission: ${subject}`,
      text
    });

    // Auto-reply to the visitor.
    try {
      await transporter.sendMail({
        from,
        to: email,
        replyTo: to,
        subject: "Thank you for contacting STARLEAF Technologies",
        text: [
          `Dear ${name},`,
          "",
          "Thank you for contacting STARLEAF Technologies. We have received your message and our team will get back to you within 24 hours.",
          "",
          `Service: ${service || "General Inquiry"}`,
          `Subject: ${subject}`,
          "",
          "Best regards,",
          "STARLEAF TECHNOLOGIES FZE LLC",
          "Engineering Intelligence. Accelerating Possibility.",
          "Dubai Silicon Oasis, Dubai, UAE",
          "Email: info@starleaftechnologies.com"
        ].join("\n")
      });
    } catch (autoReplyError) {
      console.error("Auto-reply failed:", autoReplyError);
    }

    return json(res, 200, {
      message: "Thank you. Your message has been sent successfully."
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return json(res, 500, { error: "Unable to send your message right now." });
  }
};
