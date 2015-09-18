import DEFAULT_SETTINGS_GUI from "./default-settings-gui.json";
import {PassThrough} from "stream";
import through2 from "through2";

import IPCCommandSession from "./ipc-command-session";

import WebContentsWritable from "./webcontents-writable";
import BlockUntilResolvedTransform from "./block-until-resolved-transform";

var BrowserWindow = null;

if( !global.copalGUISharedData )
  global.copalGUISharedData = {}

var GUISharedData = global.copalGUISharedData;

// TODO
// 1. Transform / PassThrough streams for all inputs and outputs
// 2. On data from input-streams: create window, create IPC streams (have one main communication channel sending events back and forth)
// 3. wait for client-side to be established and pipe into IPC streams

export default {

  /**
   * Initializes the GUI extension
   *  - registers input and output brick
   *
   * @param    {Copal}   copal   Copal instance to extend
   */
  init( copal ) {
    this.settings = copal.loadProfileConfig( "settings-gui.json" ) || {};
    this.settings = copal.defaultifyOptions( this.settings, DEFAULT_SETTINGS_GUI, true );
    global.copalGUISharedData.settings = this.settings;

    copal.bricks.addErrorBrick( "GUI.printErrorToDevtools", this.brickPrintErrorToDevtools.bind( this ) );
    copal.bricks.addInputBrick( "GUI.updateInputField", this.brickUpdateInputField.bind( this ) );
    copal.bricks.addInputBrick( "GUI.input", this.brickInput.bind( this ) );
    copal.bricks.addOutputBrick( "GUI.list-view", this.brickListView.bind( this ) );
    copal.bricks.addOutputBrick( "GUI.list-item-execute", this.brickListExecuteItem.bind( this ) );

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

        var newWindow = new BrowserWindow( this.settings.browserWindowOptions );

        newWindow.loadUrl("file://" + __dirname + "/../frontend/views/index.html");

        newWindow.on("closed", () => {
          newWindow = null;
        });

        if( this.settings.devTools )
          newWindow.openDevTools();

        newWindow.webContents.on("did-finish-load", () => {
          resolve( newWindow );
        });

      } catch ( e ) {
        reject( e );
      }

    } );
  },

  getOrCreateWindowPromise() {
    if( !this._windowPromise )
      this._windowPromise = this.createWindow().then( window => this.window = window );

    return this._windowPromise;
  },

  /**
   * Creates an IPC session for the given CommandSession
   *  - IPC session is used for communicating with the GUI window
   *
   * @param    {CommandSession}   commandSession
   */
  createIPCSession( commandSession ) {
    return new IPCCommandSession( commandSession );
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
    return GUISharedData.ipcCommandSessions[ commandSession.id ];
  },

  /**
   * Output brick for displaying list data
   *
   * @param    {CommandSession}   commandSession   CommandSession that is currently active
   * @param    {Object}           data             Data to display
   */
  brickListView ( brickAndSessionData ) {

    const session = brickAndSessionData.session;

    var waitForWindow = this.getOrCreateWindowPromise().then( () => {
      if( !this.getIPCSession( session ) )
        this.createIPCSession( session );
    });

    var blockUntilTransform = new BlockUntilResolvedTransform( { objectMode: true, promise: waitForWindow } );
    var toWebContents = new WebContentsWritable( { objectMode: true, getWindow: () => this.window, args: ["data-update", session.id] } );
    blockUntilTransform.pipe( toWebContents );

    // returning the transform only, so multiple outputs can be piped
    return blockUntilTransform;
  },

  brickListExecuteItem() {
    return new PassThrough( { objectMode: true } );
  },

  /**
   * Input brick
   *   - creates the GUI window if necessary
   *
   * @param    {CommandSession}   commandSession   CommandSession that is currently active
   *
   * @return   {Promise}                           Promise that resolves, when Input is ready
   */
  brickInput ( brickAndSessionData ) {
    const session = brickAndSessionData.session;

    var ipcSession = this.getIPCSession( session );
    if( !ipcSession )
      ipcSession = this.createIPCSession( session );

    ipcSession._inputStream = new PassThrough( { objectMode: true } );

    // session.getStream( "input" ).pipe( blockUntilWindow );

    return ipcSession._inputStream;
  },

  brickUpdateInputField ( brickAndSessionData ) {
    const session = brickAndSessionData.session;

    var ipcSession = this.getIPCSession( session );
    if( !ipcSession )
      ipcSession = this.createIPCSession( session );

    const waitForWindow = this.getOrCreateWindowPromise().then( () => {
      this.window.webContents.send( "command-changed", session.id, session.commandSession.config );
      this.window.show();
    });

    // update input field via WebContentsWritable
    var blockUntilWindow = new BlockUntilResolvedTransform( { objectMode: true, promise: waitForWindow } );
    var toWebContents = new WebContentsWritable( { objectMode: true, getWindow: () => this.window, args: ["input-update", session.id] } );
    blockUntilWindow.pipe( toWebContents );

    return [ blockUntilWindow, toWebContents ];
  },

  brickPrintErrorToDevtools( ) {

    // TODO: open devtools, but not instantly
    const waitForWindow = this.getOrCreateWindowPromise().then( () => {
      //this.window.openDevTools();
    });

    // update input field via WebContentsWritable
    const blockUntilWindow = new BlockUntilResolvedTransform( { objectMode: true, promise: waitForWindow } );
    const transformError = through2.obj( (data, enc, done) => {
      done( null, { message: data.message, stack: data.stack } );
    });
    const toWebContents = new WebContentsWritable( { objectMode: true, getWindow: () => this.window, args: ["error-update", ""] } );

    blockUntilWindow.pipe( transformError ).pipe( toWebContents );

    return blockUntilWindow;
  }

};
