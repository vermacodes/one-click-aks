import React from 'react';

import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'

import Account from './Account'
import { ResoureceGroupType, StorageAccountType } from '../dataStructures';
import State from './State';

type NavigationProps = {
  logs: string
  setLogs(arg: string): void
  prevLogsRef: React.MutableRefObject<string | null | undefined>
  isAuth: boolean
  setIsAuth(arg: boolean): void
  resourceGroup: ResoureceGroupType | undefined
  setResourceGroup(arg: ResoureceGroupType): void
  storageAccount: StorageAccountType | undefined
  setStorageAccount(arg: StorageAccountType): void
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
            <Account logs={props.logs} setLogs={props.setLogs} prevLogsRef={props.prevLogsRef} isAuth={props.isAuth} setIsAuth={props.setIsAuth} />
            {props.isAuth &&
              <>
                {' | '}
                < State
                  resourceGroup={props.resourceGroup}
                  setResourceGroup={props.setResourceGroup}
                  storageAccount={props.storageAccount}
                  setStorageAccount={props.setStorageAccount}
                />
              </>
            }
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Navigation;