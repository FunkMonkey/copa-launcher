
// require('remote').getGlobal('sharedObject').message("some fuzzy message");
import React from "react";
import CopalMain from "../scripts/components/copal-main";
import remote from "remote";
import keycode from "keycode";

var currWindow = remote.getCurrentWindow( );
var sharedData = remote.getGlobal("copalGUISharedData");

// hiding window on lost focus
currWindow.on( "blur", () => {
	if( sharedData.settings.hideOnBlur )
		currWindow.hide( );
} );

// TEMPORARY: hiding on escape
window.addEventListener( "keydown", event => {
	const key = keycode( event );

	switch( key ) {
		case "esc": currWindow.hide(); break;
		case "f12": currWindow.toggleDevTools();
	}

} )



React.render(
  <CopalMain className="copal-main" />,
  document.querySelector(".copal-content")
);
