import { useEffect, useRef, useState } from "react";
import { Row, Col, Form } from "react-bootstrap";
import { useLogs } from "../hooks/useLogs";

function Terminal() {
    const [autoScroll, setAutoScroll] = useState(true);
    const [logs, setLogs] = useState<string>("");
    const { data } = useLogs();

    const logEndRef = useRef<null | HTMLDivElement>(null);
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logs]);

    useEffect(() => {
        if (data) {
            var Convert = require("ansi-to-html");
            var convert = new Convert();
            setLogs(convert.toHtml(data.logs));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    return (
        <Row>
            <Col>
                <div style={{ textAlign: "right" }}>
                    <Form>
                        <Form.Check
                            inline
                            type="switch"
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
                        border: "1px solid white",
                        borderRadius: "2px",
                        boxShadow: "0px 0px 2px 1px rgba(0, 0, 0, 0.5)",
                        marginTop: "5px",
                        padding: "10px",
                        display: "inline-block",
                        background: "#1f1f1f",
                        color: "#f2f2f2",
                    }}
                >
                    <pre
                        dangerouslySetInnerHTML={{ __html: logs }}
                        style={{ padding: "10px", whiteSpace: "pre-wrap" }}
                    ></pre>
                    {autoScroll && <div ref={logEndRef} />}
                </div>
            </Col>
        </Row>
    );
}

export default Terminal;
