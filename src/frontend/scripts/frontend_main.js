
// require('remote').getGlobal('sharedObject').message("some fuzzy message");
import React from "react";
import CopalMain from "../scripts/components/copal-main";
import remote from "remote";
import keycode from "keycode";

var currWindow = remote.getCurrentWindow( );

// hiding window on lost focus
// TODO: find a more intelligent solution in case this is not the desired behaviour
currWindow.on( "blur", event => {
	currWindow.hide( );
} );

// TEMPORARY: hiding on escape
window.addEventListener( "keydown", event => {
	const key = keycode( event );

	if( key === "esc" )
		currWindow.hide( );
} )



React.render(
  <CopalMain className="copal-main" />,
  document.querySelector(".copal-content")
);
