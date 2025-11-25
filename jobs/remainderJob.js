// jobs/reminderJob.js
const cron = require('node-cron');
const Customer = require('../models/Customer');
const nodemailer = require('nodemailer');
const moment = require('moment');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function processReminders() {
  try {
    const now = new Date();
    // Find customers who have at least one reminder <= now and not reminded
    const customers = await Customer.find({ 'reminders.remindAt': { $lte: now }, 'reminders.reminded': false });

    for (const c of customers) {
      let changed = false;
      for (const r of c.reminders) {
        if (!r.reminded && r.remindAt <= now) {
          const to = c.email || process.env.NOTIFY_EMAIL;
          if (to) {
            const mailOptions = {
              from: process.env.SMTP_FROM || process.env.SMTP_USER,
              to,
              subject: `Reminder: ${c.name}`,
              text: `Reminder for ${c.name}:\n\n${r.message}\n\nScheduled: ${moment(r.remindAt).format('YYYY-MM-DD HH:mm')}`,
            };
            try {
              await transporter.sendMail(mailOptions);
              console.log(`Reminder sent for ${c._id} (${c.name}) to ${to}`);
            } catch (err) {
              console.error('Email send error', err);
            }
          } else {
            console.log(`No recipient for reminder on ${c._id} (${c.name})`);
          }
          r.reminded = true;
          changed = true;
        }
      }
      if (changed) {
        await c.save();
      }
    }
  } catch (err) {
    console.error('Reminder job error', err);
  }
}

function startReminderJob() {
  // run every minute for demo purposes
  cron.schedule('* * * * *', () => {
    processReminders();
  });
  console.log('Reminder job scheduled (every minute)');
}

module.exports = { startReminderJob, processReminders };
