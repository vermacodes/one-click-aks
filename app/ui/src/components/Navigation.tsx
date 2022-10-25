import React from 'react';

import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'

import Account from './Account'

type NavigationProps = {
  logs: string
  setLogs(arg: string): void
  prevLogsRef: React.MutableRefObject<string | null | undefined>
}

function Navigation(props: NavigationProps) {
    return (
        <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="#home">
            <h4>One Click AKS</h4>
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
              <Account logs={props.logs} setLogs={props.setLogs} prevLogsRef={props.prevLogsRef}/>
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    )
}

export default Navigation;