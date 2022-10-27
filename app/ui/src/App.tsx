import { useEffect, useRef, useState } from 'react';
import './App.css';

import Navigation from './components/Navigation'
import Console from './components/Console'

import ThemeProvider from 'react-bootstrap/ThemeProvider'
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import type { ResoureceGroupType, StorageAccountType } from './dataStructures'
import State from './components/State';


function App() {

  // Global State
  const [logs, setLogs] = useState("");
  const [isAuth, setIsAuth] = useState<boolean>(false)
  const [resourceGroup, setResourceGroup] = useState<ResoureceGroupType>();
  const [storageAccount, setStorageAccount] = useState<StorageAccountType>();

  const prevLogsRef = useRef<string | null>()

  useEffect(() => {
    prevLogsRef.current = logs;
  }, [logs])

  function destroyHandler() {
    fetch('http://localhost:8080/destroy')
      .then((response) => response.body)
      .then((rb) => {
        if (rb != null) {
          const reader = rb.getReader();

          return new ReadableStream({
            start(controller) {
              // The following function handles each data chunk
              function push() {
                // "done" is a Boolean and value a "Uint8Array"
                reader.read().then(({ done, value }) => {
                  // If there is no more data to read
                  if (done) {
                    console.log('done', done);
                    controller.close();
                    return;
                  }
                  // Get the data and send it to the browser via the controller
                  controller.enqueue(value);
                  // Check chunks by logging to the console
                  const decoder = new TextDecoder();
                  var Convert = require('ansi-to-html');
                  var convert = new Convert();
                  setLogs(prevLogsRef.current + convert.toHtml(decoder.decode(value)))
                  push();
                });
              }

              push();
            },
          });
        } else {
          console.log("Response body is null.")
        }
      })
      .then((stream) =>
        // Respond with our stream
        new Response(stream, { headers: { 'Content-Type': 'text/html' } }).text()
      )
      .then((result) => {
        // Do things with result
        console.log(result);
      });
  }

  function applyHandler() {
    fetch('http://localhost:8080/apply')
      .then((response) => response.body)
      .then((rb) => {
        if (rb != null) {
          const reader = rb.getReader();

          return new ReadableStream({
            start(controller) {
              // The following function handles each data chunk
              function push() {
                // "done" is a Boolean and value a "Uint8Array"
                reader.read().then(({ done, value }) => {
                  // If there is no more data to read
                  if (done) {
                    console.log('done', done);
                    controller.close();
                    return;
                  }
                  // Get the data and send it to the browser via the controller
                  controller.enqueue(value);
                  // Check chunks by logging to the console
                  const decoder = new TextDecoder();
                  var Convert = require('ansi-to-html');
                  var convert = new Convert();
                  setLogs(prevLogsRef.current + convert.toHtml(decoder.decode(value)))
                  push();
                });
              }

              push();
            },
          });
        } else {
          console.log("Response body is null.")
        }
      })
      .then((stream) =>
        // Respond with our stream
        new Response(stream, { headers: { 'Content-Type': 'text/html' } }).text()
      )
      .then((result) => {
        // Do things with result
        console.log(result);
      });
  }

  return (
    <ThemeProvider
      breakpoints={['xxxl', 'xxl', 'xl', 'lg', 'md', 'sm', 'xs', 'xxs']}
      minBreakpoint="xxs"
    >
      <div className="App">
        <Navigation
          logs={logs}
          setLogs={setLogs}
          prevLogsRef={prevLogsRef}
          isAuth={isAuth}
          setIsAuth={setIsAuth}
          resourceGroup={resourceGroup}
          setResourceGroup={setResourceGroup}
          storageAccount={storageAccount}
          setStorageAccount={setStorageAccount}
        />
        <Container className='mt-1' fluid='md'>

          {/* {!storageAccount?.id &&
            <Row style={{ textAlign: "left" }}>
              <Col>
              <State
                resourceGroup={resourceGroup}
                setResourceGroup={setResourceGroup}
                storageAccount={storageAccount}
                setStorageAccount={setStorageAccount}
              />
              </Col>
            </Row>
          } */}
          {isAuth && storageAccount?.id &&
            <Row style={{ textAlign: "left" }}>
              <Col>
                <Button as="a" variant="outline-primary" onClick={applyHandler}>Create</Button>{' '}
                <Button as="a" variant="outline-danger" onClick={destroyHandler}>Destroy</Button>{' '}
                <Button as="a" variant="outline-secondary" onClick={() => setLogs("")}>Clear Logs</Button>
              </Col>
            </Row>
          }
          {!isAuth &&
            <Row style={{ textAlign: "left" }}>
              <Col>
                <p>Auth required.</p>
              </Col>
            </Row>
          }
          {/** There is an issue with the whay scroll bar displays, that can be fixed like this. https://stackoverflow.com/a/60163005*/}
          <Row>
            <Col>
              <Console logs={logs} />
            </Col>
          </Row>
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;
