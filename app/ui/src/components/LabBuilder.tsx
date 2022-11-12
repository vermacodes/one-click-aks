import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Form, FormText, Modal } from "react-bootstrap";
import { TfvarConfigType, LabType } from "../dataStructures";

type LabBuilderPropsType = {
    showLabBuilder: boolean
    setShowLabBuilder(args: boolean): void
    tfvarConfig: TfvarConfigType
}

export default function LabBuilderM({ showLabBuilder, setShowLabBuilder, tfvarConfig }: LabBuilderPropsType) {

    const [lab, setLab] = useState<LabType>({
        name: "",
        tfvar: tfvarConfig,
        breakScript: "",
        validateScript: ""
    })

    useEffect(() => {
      setLab({
        ...lab,
        tfvar: tfvarConfig
      })
    }, [tfvarConfig])
    

    // Encode and Decode. https://stackoverflow.com/a/247261/2353460
    // Encode -> btoa(); Decode -> atob()
    function handleValidateScriptChange(newValue: string): void {
        setLab({
            ...lab,
            validateScript: btoa(newValue)
        })
    }

    function handleBreakScriptChange(newValue: string): void {
        setLab({
            ...lab,
            breakScript: btoa(newValue)
        })
    }

    function handleSubmit() {
        setShowLabBuilder(false)
        console.log("Lab Object : ", JSON.stringify(lab, null, 4))
        axios.post("http://localhost:8080/createlab", lab).then(response => {
            console.log("Response : ", response)
        })
    }

    return (
        <Modal size='lg' show={showLabBuilder} onHide={() => setShowLabBuilder(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Lab Builder</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>Name</Form.Label>
                        <Form.Control value={lab.name} onChange={(e) => setLab({
                            ...lab,
                            name: e.target.value
                        })}></Form.Control>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Template</Form.Label>
                        <Form.Control as='textarea' rows={5} value={JSON.stringify(lab.tfvar, null, 4)} readOnly></Form.Control>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Break Script</Form.Label>
                        <Form.Control as='textarea' rows={5} onChange={(e) => handleBreakScriptChange(e.target.value)}></Form.Control>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Validate Script</Form.Label>
                        <Form.Control as='textarea' rows={5} onChange={(e) => handleValidateScriptChange(e.target.value)}></Form.Control>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" className="mt-2 mr-2" onClick={() => setShowLabBuilder(false)}>
                    Cancel
                </Button>
                <Button variant="primary" className="mt-2" onClick={handleSubmit}>
                    Create
                </Button>
            </Modal.Footer>
        </Modal>
    )
}