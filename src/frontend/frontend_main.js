
// require('remote').getGlobal('sharedObject').message("some fuzzy message");
import React from "react";

// TODO: make view part of build-process, so we don't have 'build' here
import CopalMain from "../build/frontend/components/copal-main";


React.render(
  <CopalMain className="copal-main" />,
  document.querySelector(".copal-content")
);
