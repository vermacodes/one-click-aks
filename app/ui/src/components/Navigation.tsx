import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";

import { useLoginStatus } from "../hooks/useAccount";
import Account from "./Account";
import State from "./State";

function Navigation() {
    const { data: isAuth } = useLoginStatus();

    return (
        <Navbar bg="dark" variant="dark">
            <Container>
                <Navbar.Brand href="#home">
                    <h4>One Click AKS</h4>
                </Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
                    <Navbar.Text>
                        <Account />
                        {isAuth && (
                            <>
                                {" | "}
                                <State />
                            </>
                        )}
                    </Navbar.Text>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Navigation;
