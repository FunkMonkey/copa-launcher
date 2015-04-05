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
        copal.executeCommand("commands");
      });
  },

  createLauncherWindow() {
    this.launcherWindow = null;
    this.launcherWindow = new BrowserWindow({ width: 500,
                                              height: 300,
                                              "node-integration": "manual-enable-iframe",
                                              frame: false,
                                              transparent: true });


    this.launcherWindow.loadUrl("file://" + __dirname + "/../../view/index.html");

    this.launcherWindow.on("closed", () => {
      this.launcherWindow = null;
    });

    this.launcherWindow.openDevTools();
  },

  input: function ( commandSession ) {
    if( !this.getIPCSession( commandSession ) )
      this.createIPCSession( commandSession );
  },

  getIPCSession( commandSession ) {
    return launcherData.commandSessions[ commandSession.sessionID ];
  },

  createIPCSession( commandSession ) {

    // destruction is important
    commandSession.getSignal("destroy").add( commandSession => {
      this.getIPCSession( commandSession ).destroy();
      delete launcherData.commandSessions[commandSession.sessionID];
    } );

    launcherData.commandSessions[ commandSession.sessionID ] = {

      commandSession: commandSession,

      destroy() {
      },

      dispatchInput( queryString ) {
        // using the original query as a prototype, so we don't lose any other query information
        var queryObj = Object.create( this.commandSession.initialData );
        queryObj.queryString = queryString;
        this.commandSession.getSignal( "input" ).dispatch( queryObj );
      },

      dispatchSignal( signalName, datatype, signalData ) {
        this.commandSession.getSignal( signalName ).dispatch( datatype, signalData );
      }
    };
  },

  listView: function ( commandSession, data ) {
    if( !this.getIPCSession( commandSession ) )
      this.createIPCSession( commandSession );

    this.launcherWindow.webContents.send( "on-data-update", commandSession.sessionID, data );
  }


};
