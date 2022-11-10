import { useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";

type ToasterType = {
    variant: string
    heading: string
    message: string
}

export default function Toaster({ variant, heading, message }: ToasterType) {
    const [show, setShow] = useState(false);
    return (
        <ToastContainer position="top-end">
            <Toast bg={variant} onClose={() => setShow(false)} show={show} delay={3000} autohide className="mt-16">
                <Toast.Header>
                    <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
                    <strong className="me-auto">{heading}</strong>
                </Toast.Header>
                <Toast.Body>{message}</Toast.Body>
            </Toast>
        </ToastContainer>
    )
}