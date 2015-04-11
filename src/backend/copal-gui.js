var BrowserWindow = null;

var GUISharedData = global.copalGUISharedData = {
  commandSessions: {}
};

export default {

  /**
   * Initializes the GUI extension
   *  - registers input and output brick
   *
   * @param    {Copal}   copal   Copal instance to extend
   */
  init( copal ) {
    copal.bricks.addInputBrick( "standard-query-input", "GUI.input", this.brickInput.bind( this ) );
    copal.bricks.addOutputBrick( "list-title-url-icon", "GUI.list-view", this.brickListView.bind( this ) );
  },

  /**
   * Creates a GUI window
   *
   * @return   {Promise}   Promise that resolves, when window did finish loading
   */
  createWindow() {

    return new Promise( (resolve, reject) => {

      try {
        if( !BrowserWindow )
          BrowserWindow = require("browser-window"); // load module only when necessary

        var newWindow = new BrowserWindow({ width: 500,
                                            height: 300,
                                            "node-integration": "manual-enable-iframe",
                                            frame: false,
                                            transparent: true });


        newWindow.loadUrl("file://" + __dirname + "/../../view/index.html");

        newWindow.on("closed", () => {
          newWindow = null;
        });

        newWindow.openDevTools();

        newWindow.webContents.on("did-finish-load", () => {
          resolve( newWindow );
        });

      } catch ( e ) {
        reject( e );
      }

    } );
  },

  /**
   * Creates an IPC session for the given CommandSession
   *  - IPC session is used for communicating with the GUI window
   *
   * @param    {CommandSession}   commandSession
   */
  createIPCSession( commandSession ) {

    // destruction is important
    commandSession.getSignal("destroy").add( commandSession => {
      this.getIPCSession( commandSession ).destroy();
      delete GUISharedData.commandSessions[commandSession.sessionID];
    } );

    commandSession.getSignal("input").add( ( commandSession, inputData, metaData ) => {
      this.window.webContents.send( "input-update", commandSession.sessionID, inputData, metaData );
    } );

    GUISharedData.commandSessions[ commandSession.sessionID ] = {

      commandSession: commandSession,

      destroy() {
      },

      dispatchInput( queryString ) {
        // using the original query as a prototype, so we don't lose any other query information
        var queryObj = Object.create( this.commandSession.initialData );
        queryObj.queryString = queryString;
        this.commandSession.getSignal( "input" ).dispatch( queryObj, { sender: "copal-gui" } );
      },

      dispatchSignal( signalName, data, metaData ) {
        this.commandSession.getSignal( signalName ).dispatch( data, metaData );
      }
    };
  },

  /**
   * Gets the IPC session for the given CommandSession
   *  - IPC session is used for communicating with the GUI window
   *
   * @param    {CommandSession}   commandSession
   *
   * @return   {Object}                            The IPC session
   */
  getIPCSession( commandSession ) {
    return GUISharedData.commandSessions[ commandSession.sessionID ];
  },

  /**
   * Output brick for displaying list data
   *
   * @param    {CommandSession}   commandSession   CommandSession that is currently active
   * @param    {Object}           data             Data to display
   */
  brickListView: function ( commandSession, data ) {
    if( !this.getIPCSession( commandSession ) )
      this.createIPCSession( commandSession );

    this.window.webContents.send( "data-update", commandSession.sessionID, data );
  },

  /**
   * Input brick
   *   - creates the GUI window if necessary
   *
   * @param    {CommandSession}   commandSession   CommandSession that is currently active
   *
   * @return   {Promise}                           Promise that resolves, when Input is ready
   */
  brickInput: function ( commandSession ) {
    var initInput = () => {
      if( !this.getIPCSession( commandSession ) )
        this.createIPCSession( commandSession );

      this.window.show();
      this.window.webContents.send( "command-changed", commandSession.sessionID, commandSession.commandConfig );

    };

    if( !this.window ) {
      return this.createWindow()
                 .then( window => {
                   this.window = window;
                   initInput();
                 } );
    } else {
      initInput();

      // TODO: for whatever reason `return Promise.resolve()` will just resolve once the user used the input field again...
      return new Promise( resolve => setTimeout( () => resolve(), 0 ) );
    }

  }

};
