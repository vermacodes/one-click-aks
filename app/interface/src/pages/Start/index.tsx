import { useState } from "react";
import Login from "./Login";
import Server from "./Server";
import Storage from "./Storage";

type Props = {};

export default function Start({}: Props) {
  const [section, setSection] = useState<string>("server");
  return (
    <div className="my-3 mx-40 mb-2 items-center">
      <Server section={section} setSection={setSection} />
      <Login section={section} setSection={setSection} />
      <Storage section={section} setSection={setSection} />
    </div>
  );
}
