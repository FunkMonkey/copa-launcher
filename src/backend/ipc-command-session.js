
if( !global.copalGUISharedData )
  global.copalGUISharedData = {};

var sessions = global.copalGUISharedData.ipcCommandSessions = {};

export default class IPCCommandSession {
  constructor( commandSession, options ) {
    this.commandSession = commandSession;
    this._inputStream = null;

    // making the session globally available (so it can be used from the frontend)
    sessions[this.commandSession.sessionID] = this;

    // Seems prototype-functions are not visible on the other IPC end
    this.pushInput = this.pushInput;
    this.pushIntoStream = this.pushIntoStream;

  }

  destroy() {
    delete sessions[this.commandSession.sessionID];
  }

  pushInput( chunk ) {
    // using the original query as a prototype, so we don't lose any other query information
    var queryObj = Object.create( this.commandSession.commandConfig.initialData || {} );
    queryObj.queryString = chunk;
    var dataAndMeta = {
      data: queryObj,
      sender: "copal-gui"
    };

    this._inputStream.push( dataAndMeta );
  }

  pushIntoStream( streamName, chunk ) {
    this.commandSession.getStream( streamName ).push( chunk );
  }
}
