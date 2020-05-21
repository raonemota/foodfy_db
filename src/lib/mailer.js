const nodemailer = require('nodemailer')

module.exports = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "2146deed3cdfa7",
      pass: "e1ed206c2e1f80"
    }
  });