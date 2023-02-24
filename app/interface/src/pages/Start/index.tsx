import { useState } from "react";
import Login from "./Login";
import Server from "./Server";
import ServicePrincipal from "./ServicePrincipal";
import Storage from "./Storage";
import Subscription from "./Subscription";

type Props = {};

export default function Start({}: Props) {
  const [section, setSection] = useState<string>("server");
  return (
    <div className="my-3 mx-40 mb-2 items-center">
      <Server section={section} setSection={setSection} />
      <Login section={section} setSection={setSection} />
      <Subscription section={section} setSection={setSection} />
      <Storage section={section} setSection={setSection} />
      <ServicePrincipal section={section} setSection={setSection} />
    </div>
  );
}
