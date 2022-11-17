import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import ConfigBuilder from "./ConfigBuilder";
import Learning from "./Learning";
import Templates from "./Templates";

type TabbarProps = {
    setLogs(args: string): void;
    prevLogsRef: React.MutableRefObject<string | null | undefined>;
    showLabBuilder: boolean;
    setShowLabBuilder(args: boolean): void;
};

export default function Tabbar({ setLogs, prevLogsRef, showLabBuilder, setShowLabBuilder }: TabbarProps) {
    return (
        <Tabs defaultActiveKey="templates" id="uncontrolled-tab-example" className="mb-3" mountOnEnter unmountOnExit>
            <Tab eventKey="templates" title="Templates">
                <Templates />
            </Tab>
            <Tab eventKey="console" title="Builder">
                <ConfigBuilder
                    setLogs={setLogs}
                    prevLogsRef={prevLogsRef}
                    showLabBuilder={showLabBuilder}
                    setShowLabBuilder={setShowLabBuilder}
                />
            </Tab>
            <Tab eventKey="learn" title="Learning">
                <Learning setLogs={setLogs} prevLogsRef={prevLogsRef} />
            </Tab>
        </Tabs>
    );
}
