import { useEffect, useRef, useState } from 'react';

import ThemeProvider from 'react-bootstrap/ThemeProvider'
import Container from 'react-bootstrap/Container';

import { StateConfigurationType } from './dataStructures'
import Navigation from './components/Navigation'
import Terminal from './components/Terminal'
import Tabbar from './components/Tabbar';
import axios from 'axios';
import { Alert, Button, Form } from 'react-bootstrap';
import LabBuilder from './components/LabBuilder';

function App() {

  // Global State
  const [logs, setLogs] = useState("");
  const [isAuth, setIsAuth] = useState<boolean>(false)
  const [serverStatus, setServerStatus] = useState<boolean>(false)
  const [isActionInProgress, setIsActionInProgress] = useState<boolean>(false)
  const [stateStore, setStateStore] = useState<StateConfigurationType>()
  const [showLabBuilder, setShowLabBuilder] = useState(false)

  const prevLogsRef = useRef<string | null>()

  useEffect(() => {
    prevLogsRef.current = logs;
  }, [logs])

  useEffect(() => {
    axios.get("http://localhost:8080/status").then(response => {
      setServerStatus(true)
    }).catch(error => {
      console.log("Server is not running.")
    })

  }, [])

  return (
    <ThemeProvider
      breakpoints={['xxxl', 'xxl', 'xl', 'lg', 'md', 'sm', 'xs', 'xxs']}
      minBreakpoint="xxs"
    >
      <div>
        <Navigation
          setLogs={setLogs}
          prevLogsRef={prevLogsRef}
          isAuth={isAuth}
          setIsAuth={setIsAuth}
          stateStore={stateStore}
          setStateStore={setStateStore}
        />
        <Container className='mt-1' fluid='md'>
          {!serverStatus ?
            <Alert variant='danger'>
              <h1>Server is not running.</h1>
              <h5>Copy and paste following command in your terminal and refresh this page after server is running.</h5>
              <Form className='inline'>
              <Form.Text><h5>docker run -d -it -p 3000:3000 -p 8080:8080 ashishvermapu/repro</h5></Form.Text>{' '}
              <Button size='sm' onClick={() => navigator.clipboard.writeText("docker run -d -it -p 3000:3000 -p 8080:8080 ashishvermapu/repro")}>
                Copy
              </Button>
              </Form>
            </Alert>
            :
            <>
              {isAuth && stateStore?.blobContainer.name === 'tfstate' && <Tabbar setLogs={setLogs} prevLogsRef={prevLogsRef} isActionInProgress={isActionInProgress} setIsActionInProgress={setIsActionInProgress} showLabBuilder={showLabBuilder} setShowLabBuilder={setShowLabBuilder}/>}
              <Terminal logs={logs} />
            </>
          }
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;
