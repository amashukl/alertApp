const express = require('express');
const request = require('request');
const dotenv = require('dotenv');
const xml2js = require('xml2js');
const nodemailer = require('nodemailer');
const pug = require('pug');

const ips = require('./ipConfig')
const sendMail = require('./mailer');
const {compilePug} = require('./utils');

const {
  getToken,
  getJobId,
  getTrafficByJobId,
  sendAlert
} = require('./panOsApi');

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  dotenv.config({
    path: '.env.dev'
  });
} else {
  dotenv.config();
}


console.log(process.env.userName);
const app = express();

app.get('/api', (req, res) => {
  res.send('ok');
})

app.get('/api/token', (req, res) => {
  getToken(process.env.userName, process.env.password).then((response) => {
    xml2js.parseString(response.data, (err, result) => {
      process.env.token = result.response.result[0].key
      res.send({
        key: process.env.token
      });
    })
  }, error => console.log(error));
});
app.get('/api/jobid', (req, res) => {
  getJobId().then((response) => {
    // console.log(response)
    xml2js.parseString(response.data, (error, result) => {
      res.send(result.response.result);
    })
  })
});

app.get('/api/traffic', (req, res) => {
  sendAlert(req, res);
})
let count = 0;
setInterval(() => {
  console.log(++count)
  sendAlert()
}, 30000)




app.listen(process.env.PORT, () => {
  console.log('server started on ' + process.env.PORT);
})
