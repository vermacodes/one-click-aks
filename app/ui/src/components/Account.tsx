import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Button } from 'react-bootstrap'
import type { AccountType } from '../dataStructures'

type AccountProps = {
  logs: string
  setLogs(arg: string): void
  prevLogsRef: React.MutableRefObject<string | null | undefined>
  isAuth: boolean
  setIsAuth(arg: boolean): void
}

function Account(props: AccountProps) {
    //const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [currAccount, setCurrAccount] = useState<AccountType>()

    // useEffect(() => {
    //     if (!props.isAuth){
    //       console.log("Trigger")
    //       getLoginStatus()
    //     }
    // }, [])

    useEffect(() => {
        if(props.isAuth) {
            getCurrentAccount()
        } else {
          getLoginStatus()
        }
    }, [props.isAuth])

    function getCurrentAccount() {
        axios.get('http://localhost:8080/accountshow').then(response => {
            setCurrAccount(response.data)
        }).catch(error => {
            console.error(error)
        })
    }
    
    function getLoginStatus() {
        axios.get('http://localhost:8080/loginstatus').then(response => {
            props.setIsAuth(response.data.isLoggedIn)
        }).catch(response => {
            console.error(response)
        })
    }

    function loginHandler() {
        fetch('http://localhost:8080/login')
          .then((response) => response.body)
          .then((rb) => {
            if(rb != null){
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
                      getLoginStatus()
                      props.setLogs("")
                      return;
                    }
                    // Get the data and send it to the browser via the controller
                    controller.enqueue(value);
                    // Check chunks by logging to the console
                    const decoder = new TextDecoder();
                    var Convert = require('ansi-to-html');
                    var convert = new Convert();
                    props.setLogs(props.prevLogsRef.current + convert.toHtml(decoder.decode(value)))
                    push();
                  });
                }
    
                push();
              },
            });
          } else {
            console.log("Response body is null.")
          }})
          .then((stream) =>
            // Respond with our stream
            new Response(stream, { headers: { 'Content-Type': 'text/html' } }).text()
          )
          .then((result) => {
            // Do things with result
            console.log(result);
          });
      }

    return(
        <>
            {(props.isAuth)
                ? <>{currAccount?.user.name} | {currAccount?.name}</>
                : <Button variant="primary" onClick={loginHandler}>Login</Button>
            }
        </>
    )
}

export default Account;