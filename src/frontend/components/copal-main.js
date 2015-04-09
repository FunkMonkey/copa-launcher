import remote from "remote";
import ipc from "ipc";

import React from "react";
import CopalInput from "./copal-input";
import CopalViewList from "./copal-view-list";

export default class CopalMain extends React.Component {

  constructor( props ) {
    super( props );

    this.backendData = null;

    this.state = {
      listData: []
    };
  }

  componentWillMount() {
    this.backendData = remote.getGlobal("copalGUISharedData");

    ipc.on( "on-data-update", ( sessionID, data ) => {
      this.currSessionID = sessionID;
      this.onDataChange( data );
    });
  }

  componentDidMount() {
    // React.findDOMNode( this.refs.list.focus() );
  }

  onDataChange( data ) {
    this.setState( {
      listData: data
    } );
  }

  onInputChange( query ) {
    this.backendData.commandSessions[this.currSessionID].dispatchInput( query );
  }

  onItemExecute( item ) {
    this.backendData.commandSessions[this.currSessionID].dispatchSignal( "listitem-execute", "listitem-title-url-icon", item );
  }

  onInputExit() {
    React.findDOMNode( this.refs.list ).focus();
    this.refs.list.selectFirst();
  }

  render() {
    return (
      <div className={this.props.className}>
        <div className="copal-main-settings-button">...</div>

        <div className="copal-main-top-row copal-dark-box">
          <button className="copal-main-command">Command</button>
          <CopalInput className="copal-main-input"
                      onChange={this.onInputChange.bind(this)}
                      onUserExit={this.onInputExit.bind(this)} />
        </div>

        <div className="copal-main-resultbox copal-dark-box">
          <CopalViewList ref="list"
                         items={this.state.listData}
                         onItemExecute={this.onItemExecute.bind(this)} />
        </div>
      </div>
    );
  }
}
