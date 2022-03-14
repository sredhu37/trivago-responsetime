import React, { useState } from 'react';
import './App.css';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Spinner from 'react-bootstrap/Spinner';
// import Card from 'react-bootstrap/Card';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
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
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  return (
    <div className="App">
      <div className='background'></div>
      <div className='foreground'>
        {/* <Card style={{ width: '100%' }}>
          <Card.Body>
            <Card.Title>TRIVAGO AND COMPETITORS</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">Latency = T_response - T_request</Card.Subtitle>
            <Card.Text>
              <li>I have compared latencies of some applications related to the Travel industry.</li>
              <li>The data is sorted according to average of the 3 regions.</li>
              <li>All the measurements are in seconds.</li>
            </Card.Text>
          </Card.Body>
        </Card> */}

        <Table class="table" striped bordered hover>
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
        <Button onClick={() => getRows(setRows, setIsLoading, setShowError, setErrorMsg)} variant="primary">Test</Button>
        <br /><br />
        {isLoading ? <Spinner animation="grow" variant="primary" /> : null}

        <ToastContainer className="p-3" position="bottom-center">
          <Toast onClose={() => setShowError(!showError)} show={showError}>
            <Toast.Header>
              <img
                src="holder.js/20x20?text=%20"
                className="rounded me-2"
                alt=""
              />
              <strong className="me-auto">ERROR</strong>
            </Toast.Header>
            <Toast.Body>{errorMsg}. Please try again after sometime!</Toast.Body>
          </Toast>
        </ToastContainer>
      </div>
    </div>
  );
}

const getRows = async (setRows, setIsLoading, setShowError, setErrorMsg) => {
  const requests = [
    axios.get(`${process.env.REACT_APP_US_SERVER_URL}/testspeed?urls=${urls.join()}`),
    axios.get(`${process.env.REACT_APP_EUROPE_SERVER_URL}/testspeed?urls=${urls.join()}`),
    axios.get(`${process.env.REACT_APP_ASIA_SERVER_URL}/testspeed?urls=${urls.join()}`)
  ]
  try {
    setShowError(false)
    setIsLoading(true)
    const [responseUS, responseEurope, responseAsia]  = await axios.all(requests)

    const results = urls.map(url => {
      if (responseUS && responseUS.data && responseEurope && responseEurope.data && responseAsia && responseAsia.data) {
        return {
          url: url,
          responseTimeUS: responseUS.data.find(d => d.url === url).responseTimeInSec,
          responseTimeEurope: responseEurope.data.find(d => d.url === url).responseTimeInSec,
          responseTimeAsia: responseAsia.data.find(d => d.url === url).responseTimeInSec
        }
      } else {
        console.log(`responseUS.data: ${responseUS.data} responseEurope.data: ${responseEurope.data} responseAsia.data: ${responseAsia.data}`)
      }
    })

    results.sort((a, b) => (a.responseTimeEurope + a.responseTimeUS + a.responseTimeAsia) - (b.responseTimeEurope + b.responseTimeUS + b.responseTimeAsia))   // Sort according to avg responseTime of 3 regions

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
    setErrorMsg(err.message)
    setShowError(true)
  } finally {
    setIsLoading(false)
  }
}

export default App;
