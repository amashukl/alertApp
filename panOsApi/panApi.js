const axios = require('axios');
const moment = require('moment');
const xml2js = require('xml2js');

const ips = require('./../ipConfig');
const {compilePug} = require('./../utils');
const sendMail = require('./../mailer');

const getToken = (userName, password) => (
  axios.get(process.env.baseUrl, {params: {
    user: userName,
    password: password,
    type:'keygen'
  }})
)

const getJobId = () => {
  const delay = moment(new Date(new Date().getTime() -30000) ).format('YYYY/MM/DD HH:mm:ss');
  return axios.get(process.env.baseUrl, {
    params:{
    'type': 'log',
    'log-type': 'traffic',
    'query': `( receive_time geq '${delay}' ) and ${generateIpForParam(ips.destinations)} and ( session_end_reason eq aged-out )`
  }, auth: {
    username: process.env.userName,
    password: process.env.password
  }})
}

const getTrafficByJobId = (id) => {
  return axios.get(process.env.baseUrl, {
    params: {
      'type': 'log',
      'log-type': 'traffic',
      'action': 'get',
      'job-id': id
    }, auth: {
      username: process.env.userName,
      password: process.env.password
    }
  })
}

const generateIpForParam = (list) => {
  let arr = [];
  list.forEach(app => {
    arr.push(`(addr.dst in ${app.ip})`);
  } )
  return arr.join(' or ');
}

const sendAlert = (req, res) => {
  getJobId().then((response) => {
    xml2js.parseString(response.data, (error, result) => {
      const jobId = result.response.result[0].job[0];
      getTrafficByJobId(jobId).then(response => {
        xml2js.parseString(response.data, (error, result) => {
          // res.send(result.response.result);
          const traficLog = result.response.result[0].log[0].logs[0].entry;
          if (traficLog) {
            const groupedByIp = traficLog.groupBy('dst')
            const filteredIps = ips.destinations.filter((elem) => {
              if (elem.ip in groupedByIp) {
                return elem;
              }
            })
            compilePug('./templates/mailer.pug', {ips: filteredIps}, (err, html) => {
              const fromAddress = 'alerticicinetwork@gmail.com';
              const toAddress = 'alerticicinetwork@gmail.com';
              const subject = 'Palo Alto firewall alert for ICICI core applications';
              sendMail(fromAddress, toAddress, subject, html, (err, sent) => {
                // res.send(sent);
                if (res) {
                  res.send(sent);
                }
              })
            })

          } else  {
            if (res) {
              res.send('no Address found');
            }
            console.log(false);
          }
        })
      })
    })
  })
}

module.exports = {
  getToken,
  getJobId,
  getTrafficByJobId,
  sendAlert
};
