import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import ConfigBuilder from './ConfigBuilder';
import Templates from './Templates';

type TabbarProps = {
    setLogs(args: string): void
    prevLogsRef: React.MutableRefObject<string | null | undefined>
    isActionInProgress: boolean
    setIsActionInProgress(args: boolean): void
}

export default function Tabbar({setLogs, prevLogsRef, isActionInProgress, setIsActionInProgress}: TabbarProps) {
  return (
    <Tabs
      defaultActiveKey="console"
      id="uncontrolled-tab-example"
      className="mb-3"
    >
      <Tab eventKey="templates" title="Templates">
        <Templates setLogs={setLogs} prevLogsRef={prevLogsRef} isActionInProgress={isActionInProgress} setIsActionInProgress={setIsActionInProgress}/>
      </Tab>
      <Tab eventKey="console" title="Builder">
        <ConfigBuilder setLogs={setLogs} prevLogsRef={prevLogsRef} isActionInProgress={isActionInProgress} setIsActionInProgress={setIsActionInProgress}/>
      </Tab>
    </Tabs>
  );
}