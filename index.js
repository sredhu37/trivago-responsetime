const express = require('express')
const axios = require('axios')

const app = express()
const axiosInstance = axios.create()
const port = 3000

axiosInstance.interceptors.request.use((config) => {
  config.headers['request-startTime'] = process.hrtime()
  return config
})

axiosInstance.interceptors.response.use((response) => {
  const start = response.config.headers['request-startTime']
  const end = process.hrtime(start)
  response.headers['request-duration'] = end[0]
  return response
})

app.get("/", (req, res) => {
  res.send("App seems to be working fine")
})

app.get("/trivago", (req, res) => {
  axiosInstance({
    method: "get",
    url: "https://trivago.com",
    timeout: 20 * 1000  // 20 seconds
  })
  .then(resp => {
    res.send({url: resp.config.url, responseTimeInSec: resp.headers['request-duration']})
  })
  .catch(error => {
    res.send(`Error: ${error}`)
  })
})

app.get("/metrics", (req, res) => {
  const urls = [
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
    timeout: 20 * 1000  // 20 seconds
  }))

  axios.all(reqs)
  .then(axios.spread((...responses) => {
    durations = responses.map(r => {
      return {
        url: r.config.url,
        responseTimeInSec: r.headers['request-duration']
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
