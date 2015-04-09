var BrowserWindow = require("browser-window");

var GUISharedData = global.copalGUISharedData = {
  commandSessions: {}
};

export default {
  init( copal ) {

    copal.bricks.addInputBrick( "standard-query-input", "GUI.input", this.input.bind( this ) );
    copal.bricks.addOutputBrick( "list-title-url-icon", "GUI.list-view", this.listView.bind( this ) );

    // TODO: don't create the window in init
    this.createWindow();
    this.window.webContents.on("did-finish-load", () => {
        copal.executeCommand("commands");
      });
  },

  createWindow() {
    this.window = null;
    this.window = new BrowserWindow({ width: 500,
                                              height: 300,
                                              "node-integration": "manual-enable-iframe",
                                              frame: false,
                                              transparent: true });


    this.window.loadUrl("file://" + __dirname + "/../../view/index.html");

    this.window.on("closed", () => {
      this.window = null;
    });

    this.window.openDevTools();
  },

  input: function ( commandSession ) {
    if( !this.getIPCSession( commandSession ) )
      this.createIPCSession( commandSession );
  },

  getIPCSession( commandSession ) {
    return GUISharedData.commandSessions[ commandSession.sessionID ];
  },

  createIPCSession( commandSession ) {

    // destruction is important
    commandSession.getSignal("destroy").add( commandSession => {
      this.getIPCSession( commandSession ).destroy();
      delete GUISharedData.commandSessions[commandSession.sessionID];
    } );

    GUISharedData.commandSessions[ commandSession.sessionID ] = {

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

    this.window.webContents.send( "on-data-update", commandSession.sessionID, data );
  }


};
