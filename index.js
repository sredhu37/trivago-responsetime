const express = require('express')
const axios = require('axios')
const cors = require('cors')

const app = express()
app.use(cors())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

const axiosInstance = axios.create()
const port = 3000

axiosInstance.interceptors.request.use((config) => {
  config.headers['request-startTime'] = process.hrtime()
  return config
})

axiosInstance.interceptors.response.use((response) => {
  const start = response.config.headers['request-startTime']
  const end = process.hrtime(start)
  const milliseconds = Math.round((end[0] * 1000) + (end[1] / 1000000))
  response.headers['request-duration'] = milliseconds
  return response
})

app.get("/", (req, res) => {
  res.send("App seems to be working fine")
})

/**
 * req.query.urls need to be a comma separated list of urls
 * If empty, we will evaluate the default urls
 */
app.get("/testspeed", (req, res) => {
  const urls = req.query.urls ? req.query.urls.split(',') : [
    "https://trivago.com",
    "https://booking.com",
    "https://airbnb.com",
    "https://agoda.com",
    "https://expedia.com",
    "https://kayak.com",
    "https://hotels.com",
    "https://tripadvisor.com"
  ]

  const reqs = urls.map(url => axiosInstance({
    method: "get",
    url: url,
    // timeout: 20 * 1000  // 20 seconds
  }))

  axios.all(reqs)
  .then(axios.spread((...responses) => {
    durations = responses.map(r => {
      return {
        url: r.config.url,
        responseTimeInSec: r.headers['request-duration']/1000
      }
    })
    res.send(durations)
  }))
  .catch(errors => {
    res.send(`Errors: ${errors}`)
  })
})

app.listen(port, () => {
  console.log(`App listening on port: ${port}`)
})
