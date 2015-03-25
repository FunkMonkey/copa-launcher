var remote = require("remote");
var ipc = require("ipc");

var CopalMain = React.createClass({

  query: "",
  data: [],

  backendData: null,

  currSesssionID: 0,

  componentWillMount() {
    this.backendData = remote.getGlobal("launcherData");

    ipc.on( "on-data-update", ( sessionID, data ) => {
      this.currSessionID = sessionID;
      this.onDataChange( data );
    });
  },

  getInitialState() {
    return {
      listData: this.data
    };
  },

  onDataChange( data ) {
    this.data = data;

    this.updateView( data );
  },

  onInputChange( query ) {
    this.query = query;

    this.backendData.commandSessions[this.currSessionID].dispatchInput( query );
  },

  onItemExecute( item ) {
    this.backendData.commandSessions[this.currSessionID].dispatchSignal( "listitem-execute", "listitem-title-url-icon", item );
  },

  updateView( data ) {
    var newState = {
      listData: data
    };

    this.setState( newState );
  },

  render() {
    return (
      <div className={this.props.className}>
        <div className="copal-main-settings-button">...</div>
        <div className="copal-main-top-row copal-dark-box">
          <button className="copal-main-command">Command</button>
          <CopalInput className="copal-main-input" onChange={this.onInputChange} />
        </div>
        <div className="copal-main-resultbox copal-dark-box">
          <CopalViewList items={this.state.listData} onItemExecute={this.onItemExecute} />
        </div>
      </div>
    );
  }
});
