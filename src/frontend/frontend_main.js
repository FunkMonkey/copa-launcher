
// require('remote').getGlobal('sharedObject').message("some fuzzy message");
import React from "react";

import CopalMain from "../build/frontend/components/copal-main";


React.render(
  <CopalMain className="copal-main" />,
  document.querySelector(".copal-content")
);
