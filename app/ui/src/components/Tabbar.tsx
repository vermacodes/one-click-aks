import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import ConfigBuilder from "./ConfigBuilder";
import Learning from "./Learning";
import Templates from "./Templates";

export default function Tabbar() {
    return (
        <Tabs defaultActiveKey="templates" id="uncontrolled-tab-example" className="mb-3" mountOnEnter unmountOnExit>
            <Tab eventKey="templates" title="Templates">
                <Templates />
            </Tab>
            <Tab eventKey="console" title="Builder">
                <ConfigBuilder />
            </Tab>
            <Tab eventKey="learn" title="Learning">
                <Learning />
            </Tab>
        </Tabs>
    );
}
