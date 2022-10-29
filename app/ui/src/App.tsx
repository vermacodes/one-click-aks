import { useEffect, useRef, useState } from 'react';
import './App.css';

import ThemeProvider from 'react-bootstrap/ThemeProvider'
import Container from 'react-bootstrap/Container';

import { StateConfigurationType } from './dataStructures'
import Console from './components/Console';
import Navigation from './components/Navigation'
import Terminal from './components/Terminal'


function App() {

  // Global State
  const [logs, setLogs] = useState("");
  const [isAuth, setIsAuth] = useState<boolean>(false)
  const [stateStore, setStateStore] = useState<StateConfigurationType>()

  const prevLogsRef = useRef<string | null>()

  useEffect(() => {
    prevLogsRef.current = logs;
  }, [logs])

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
          stateStore={stateStore}
          setStateStore={setStateStore}
        />
        <Container className='mt-1' fluid='md'>
          {isAuth && stateStore?.blobContainer.name === 'tfstate' && <Console setLogs={setLogs} prevLogsRef={prevLogsRef} />}
          <Terminal logs={logs} />
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;
