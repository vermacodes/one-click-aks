import { BlobType, LabType, TfvarConfigType } from "../dataStructures";

export function actionHandler(url: string, prevLogsRef: React.MutableRefObject<string | null | undefined>, setFunction: any, streamEndActions: any) {
    fetch(url)
        .then((response) => response.body)
        .then((rb) => {
            if (rb != null) {
                const reader = rb.getReader();
                return new ReadableStream({
                    start(controller) {
                        // The following function handles each data chunk
                        function push() {
                            // "done" is a Boolean and value a "Uint8Array"
                            reader.read().then(({ done, value }) => {
                                // If there is no more data to read
                                if (done) {
                                    console.log('done', done);
                                    controller.close();
                                    streamEndActions()
                                    return;
                                }
                                // Get the data and send it to the browser via the controller
                                controller.enqueue(value);
                                // Check chunks by logging to the console
                                const decoder = new TextDecoder();
                                var Convert = require('ansi-to-html');
                                var convert = new Convert();
                                setFunction(prevLogsRef.current + convert.toHtml(decoder.decode(value)))
                                push();
                            });
                        }
                        push();
                    },
                });
            } else {
                console.log("Response body is null.")
            }
        })
        .then((stream) =>
            // Respond with our stream
            new Response(stream, { headers: { 'Content-Type': 'text/html' } }).text()
        )
        .then((result) => {
            // Do things with result
            console.log(result);
        });
}


export function actionHandlerPost(url: string, prevLogsRef: React.MutableRefObject<string | null | undefined>, setFunction: any, streamEndActions: any, payload: TfvarConfigType | BlobType) {
    console.log(JSON.stringify(payload))
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
            "Content-type": "application/json"
        }
    }).then((response) => response.body)
        .then((rb) => {
            if (rb != null) {
                const reader = rb.getReader();
                return new ReadableStream({
                    start(controller) {
                        // The following function handles each data chunk
                        function push() {
                            // "done" is a Boolean and value a "Uint8Array"
                            reader.read().then(({ done, value }) => {
                                // If there is no more data to read
                                if (done) {
                                    console.log('done', done);
                                    controller.close();
                                    streamEndActions()
                                    return;
                                }
                                // Get the data and send it to the browser via the controller
                                controller.enqueue(value);
                                // Check chunks by logging to the console
                                const decoder = new TextDecoder();
                                var Convert = require('ansi-to-html');
                                var convert = new Convert();
                                setFunction(prevLogsRef.current + convert.toHtml(decoder.decode(value)))
                                push();
                            });
                        }
                        push();
                    },
                });
            } else {
                console.log("Response body is null.")
            }
        })
        .then((stream) =>
            // Respond with our stream
            new Response(stream, { headers: { 'Content-Type': 'text/html' } }).text()
        )
        .then((result) => {
            // Do things with result
            console.log(result);
        });
}