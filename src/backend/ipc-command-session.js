
if( !global.copalGUISharedData )
  global.copalGUISharedData = {};

var sessions = global.copalGUISharedData.ipcCommandSessions = {};

export default class IPCCommandSession {
  constructor( commandSessionData, options ) {
    this.commandSessionData = commandSessionData;
    this._inputStream = null;

    // making the session globally available (so it can be used from the frontend)
    sessions[this.commandSessionData.session.sessionID] = this;

    // Seems prototype-functions are not visible on the other IPC end
    this.pushInput = this.pushInput;
    this.pushIntoStream = this.pushIntoStream;

  }

  destroy() {
    delete sessions[this.commandSessionData.session.sessionID];
  }

  pushInput( chunk ) {
    // using the original query as a prototype, so we don't lose any other query information
    var queryObj = Object.create( this.commandSessionData.session.commandConfig.initialData || {} );
    queryObj.queryString = chunk;
    queryObj.sender = "copal-gui";

    this._inputStream.push( queryObj );
  }

  pushIntoStream( streamName, chunk ) {
    this.commandSessionData.session.getStream( streamName ).push( chunk );
  }
}
