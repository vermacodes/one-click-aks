import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import ConfigBuilder from './ConfigBuilder';
import Learning from './Learning';
import Templates from './Templates';

type TabbarProps = {
    setLogs(args: string): void
    prevLogsRef: React.MutableRefObject<string | null | undefined>
    isActionInProgress: boolean
    setIsActionInProgress(args: boolean): void
    showLabBuilder: boolean
    setShowLabBuilder(args: boolean): void
}

export default function Tabbar({setLogs, prevLogsRef, isActionInProgress, setIsActionInProgress, showLabBuilder, setShowLabBuilder}: TabbarProps) {
  return (
    <Tabs
      defaultActiveKey="templates"
      id="uncontrolled-tab-example"
      className="mb-3"
      mountOnEnter
      unmountOnExit
    >
      <Tab eventKey="templates" title="Templates">
        <Templates setLogs={setLogs} prevLogsRef={prevLogsRef} isActionInProgress={isActionInProgress} setIsActionInProgress={setIsActionInProgress}/>
      </Tab>
      <Tab eventKey="console" title="Builder">
        <ConfigBuilder setLogs={setLogs} prevLogsRef={prevLogsRef} isActionInProgress={isActionInProgress} setIsActionInProgress={setIsActionInProgress} showLabBuilder={showLabBuilder} setShowLabBuilder={setShowLabBuilder}/>
      </Tab>
      <Tab eventKey="learn" title="Learning">
        <Learning setLogs={setLogs} prevLogsRef={prevLogsRef} isActionInProgress={isActionInProgress} setIsActionInProgress={setIsActionInProgress}/>
      </Tab>
    </Tabs>
  );
}