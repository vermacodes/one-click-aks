import { useEffect, useRef, useState } from "react"
import { Row, Col, Form } from "react-bootstrap"

type TerminalProps = {
  logs: string
}

function Terminal({logs}: TerminalProps) {

  const [autoScroll, setAutoScroll] = useState(true)

  const logEndRef = useRef<null | HTMLDivElement>(null)
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  return (
    <Row>
      <Col>
        <div style={{ textAlign: "right" }}>
          <Form>
            <Form.Check
              inline
              type='switch'
              label="Auto Scroll"
              value="autoscroll"
              id="autoscroll"
              defaultChecked
              onChange={() => setAutoScroll(!autoScroll)}
            />
          </Form>
        </div>
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
          <pre dangerouslySetInnerHTML={{ __html: logs }} style={{ padding: "10px", whiteSpace: "pre-wrap" }}></pre>
          {autoScroll && <div ref={logEndRef} />}
        </div>
      </Col>
    </Row>
  )
}

export default Terminal