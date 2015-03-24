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
      <div>
        <CopalInput onChange={this.onInputChange} />
        <CopalViewList items={this.state.listData} onItemExecute={this.onItemExecute} />
      </div>
    );
  }
});
