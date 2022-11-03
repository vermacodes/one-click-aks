import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import ConfigBuilder from './ConfigBuilder';
import Templates from './Templates';

type TabbarProps = {
    setLogs(args: string): void
    prevLogsRef: React.MutableRefObject<string | null | undefined>
}

export default function Tabbar(props: TabbarProps) {
  return (
    <Tabs
      defaultActiveKey="console"
      id="uncontrolled-tab-example"
      className="mb-3"
    >
      <Tab eventKey="console" title="Console">
        <ConfigBuilder setLogs={props.setLogs} prevLogsRef={props.prevLogsRef}/>
      </Tab>
      <Tab eventKey="templates" title="Templates">
        <Templates />
      </Tab>
    </Tabs>
  );
}