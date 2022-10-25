import React from "react"

type ConsoleProps = {
    logs: string
}

function Console(props: ConsoleProps ) {
    return(
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
        <pre dangerouslySetInnerHTML={{ __html: props.logs}} style={{ padding: "10px", whiteSpace: "pre-wrap" }}></pre>
      </div>
    )
}

export default Console