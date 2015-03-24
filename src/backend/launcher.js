var BrowserWindow = require("browser-window");

var launcherData = global.launcherData = {
  commandSessions: {}
};

export default {
  init( copal ) {

    copal.bricks.addInputBrick( "standard-query-input", "Launcher.input", this.input.bind( this ) );
    copal.bricks.addOutputBrick( "list-title-url-icon", "Launcher.list-view", this.listView.bind( this ) );

    // TODO: don't create the window in init
    this.createLauncherWindow();
    this.launcherWindow.webContents.on("did-finish-load", () => {
        copal.executeCommand("test");
      });
  },

  createLauncherWindow() {
    this.launcherWindow = null;
    this.launcherWindow = new BrowserWindow({ width: 1024,
                                    height: 1000,
                                    "node-integration": "manual-enable-iframe",
                                    "web-preferences": {
                                     "web-security": false
                                    } });


    this.launcherWindow.loadUrl("file://" + __dirname + "/../../view/index.html");

    this.launcherWindow.on("closed", () => {
      this.launcherWindow = null;
    });

    this.launcherWindow.openDevTools();
  },

  input: function ( commandSession ) {
    console.log( "input initialized" );

    if( !this.getIPCSession( commandSession ) )
      this.createIPCSession( commandSession );

      // setTimeout( function ( ) {
      //   onInput( "Foobar" );
      // }, 5000 );
  },

  getIPCSession( commandSession ) {
    return launcherData.commandSessions[ commandSession.sessionID ];
  },

  createIPCSession( commandSession ) {
    launcherData.commandSessions[ commandSession.sessionID ] = {

      commandSession: commandSession,

      dispatchInput( query ) {
        this.commandSession.getSignal( "input" ).dispatch( this.commandSession, query );
      },

      dispatchSignal( signalName, datatype, signalData ) {
        this.commandSession.getSignal( signalName ).dispatch( this.commandSession, datatype, signalData );
      }
    };
  },

  listView: function ( commandSession, data ) {
    if( !this.getIPCSession( commandSession ) )
      this.createIPCSession( commandSession );

    this.launcherWindow.webContents.send( "on-data-update", commandSession.sessionID, data );
  }


};
