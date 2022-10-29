import { useEffect, useRef } from "react"
import { Row, Col } from "react-bootstrap"
import ScrollableFeed from 'react-scrollable-feed'

type TerminalProps = {
  logs: string
}

function Terminal(props: TerminalProps) {

  const logEndRef = useRef<null | HTMLDivElement>(null)
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [props.logs])

  return (
    <Row>
      <Col>
        <div
          style={{
            textAlign: "left",
            height: "500px",
            width: "100%",
            overflow: "auto",
            border: "1px solid black",
            borderRadius: "2px",
            boxShadow: "0px 0px 2px 1px rgba(0, 0, 0, 0.5)",
            marginTop: "5px",
            padding: "10px",
            display: "inline-block"
          }}
        >
          <pre dangerouslySetInnerHTML={{ __html: props.logs }} style={{ padding: "10px", whiteSpace: "pre-wrap" }}></pre>
          <div ref={logEndRef} />
        </div>
      </Col>
    </Row>
  )
}

export default Terminal