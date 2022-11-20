import Container from "react-bootstrap/Container";
//import ThemeProvider from "react-bootstrap/ThemeProvider";

import { Alert, Button, Form } from "react-bootstrap";
import { useLoginStatus } from "../hooks/useAccount";
import { useServerStatus } from "../hooks/useServerStatus";
import { useGetStorageAccount } from "../hooks/useStorageAccount";
import Navigation from "./Navigation";
import Tabbar from "./Tabbar";
import Terminal from "./Terminal";

export default function Main() {
    const { data: serverStatus } = useServerStatus();
    const { data: isAuth } = useLoginStatus();
    const { data: stateStore } = useGetStorageAccount();

    return (
        // <ThemeProvider breakpoints={["xxxl", "xxl", "xl", "lg", "md", "sm", "xs", "xxs"]} minBreakpoint="xxs">
        <div>
            <Navigation />
            <Container className="mt-1" fluid="md">
                {!serverStatus ? (
                    <Alert variant="danger">
                        <h1>Server is not running.</h1>
                        <h5>
                            Copy and paste following command in your terminal and refresh this page after server is
                            running.
                        </h5>
                        <Form className="inline">
                            <Form.Text>
                                <h5>docker run -d -it -p 3000:3000 -p 8080:8080 ashishvermapu/repro</h5>
                            </Form.Text>{" "}
                            <Button
                                size="sm"
                                onClick={() =>
                                    navigator.clipboard.writeText(
                                        "docker run -d -it -p 3000:3000 -p 8080:8080 ashishvermapu/repro"
                                    )
                                }
                            >
                                Copy
                            </Button>
                        </Form>
                    </Alert>
                ) : (
                    <>
                        {isAuth && stateStore?.blobContainer.name === "tfstate" && <Tabbar />}
                        <Terminal />
                    </>
                )}
            </Container>
        </div>
        //</ThemeProvider>
    );
}
