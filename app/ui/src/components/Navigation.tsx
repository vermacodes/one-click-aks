import React from 'react';

import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'

import Account from './Account'
import { StateConfigurationType } from '../dataStructures';
import State from './State';
import { Button } from 'react-bootstrap';

type NavigationProps = {
  setLogs(arg: string): void
  prevLogsRef: React.MutableRefObject<string | null | undefined>
  isAuth: boolean
  setIsAuth(arg: boolean): void
  stateStore: StateConfigurationType | undefined
  setStateStore(args: StateConfigurationType): void
}

function Navigation({setLogs, prevLogsRef, isAuth, setIsAuth, stateStore, setStateStore}: NavigationProps) {
  return (
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand href="#home">
          <h4>One Click AKS</h4>
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            <Account setLogs={setLogs} prevLogsRef={prevLogsRef} isAuth={isAuth} setIsAuth={setIsAuth} />
            {isAuth &&
              <>
                {' | '}
                < State
                  stateStore={stateStore}
                  setStateStore={setStateStore}
                />
              </>
            }
            {'  '}
            <Button size="sm" variant='outline-danger' disabled>Destroy</Button>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Navigation;