const nodemailer = require('nodemailer');

const YOUR_NAME = 'ICICI bank';

const smtpTransport = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  auth: {
    user: "alerticicinetwork",
    pass: "babakijai"
  }
});

const sendMail = function(fromAddress, toAddress, subject, content, next){
  let success = true;
  const mailOptions = {
    from: YOUR_NAME + ' <' + fromAddress + '>',
    to: toAddress,
    replyTo: fromAddress,
    subject: subject,
    html: content
  };

  // send the email!
  smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
      console.log('[ERROR] Message NOT sent: ', error);
      success = false;
    }
    else {
      console.log('[INFO] Message Sent: ' + response.message);
    }
    next(error, success);
  });
};

module.exports = sendMail;
