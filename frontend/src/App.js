import React, { useState } from 'react';
import './App.css';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Spinner from 'react-bootstrap/Spinner';
const axios = require('axios');


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

function App() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="App">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>URL</th>
            <th>US</th>
            <th>Europe</th>
            <th>Asia</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </Table>
      <Button onClick={() => getRows(setRows, setIsLoading)} variant="primary">Test</Button>
      <br /><br />
      {isLoading ? <Spinner animation="grow" variant="primary" /> : null}
    </div>
  );
}

const getRows = async (setRows, setIsLoading) => {
  const requests = [
    axios.get(`${process.env.REACT_APP_US_SERVER_URL}/testspeed?urls=${urls.join()}`),
    axios.get(`${process.env.REACT_APP_EUROPE_SERVER_URL}/testspeed?urls=${urls.join()}`),
    axios.get(`${process.env.REACT_APP_ASIA_SERVER_URL}/testspeed?urls=${urls.join()}`)
  ]
  try {
    setIsLoading(true)
    const [responseUS, responseEurope, responseAsia]  = await axios.all(requests)

    const results = urls.map(url => {
      return {
        url: url,
        responseTimeUS: responseUS.data.find(d => d.url === url).responseTimeInSec,
        responseTimeEurope: responseEurope.data.find(d => d.url === url).responseTimeInSec,
        responseTimeAsia: responseAsia.data.find(d => d.url === url).responseTimeInSec
      }
    })

    results.sort((a, b) => a.responseTimeEurope - b.responseTimeEurope)   // Sort according to responseTimeEurope

    setRows(results.map((sitedata, index) =>
      <tr key={index}>
        <td>{sitedata.url}</td>
        <td>{sitedata.responseTimeUS}</td>
        <td>{sitedata.responseTimeEurope}</td>
        <td>{sitedata.responseTimeAsia}</td>
      </tr>
    ))
  } catch(err) {
    console.log(err)
  } finally {
    setIsLoading(false)
  }
}

export default App;
