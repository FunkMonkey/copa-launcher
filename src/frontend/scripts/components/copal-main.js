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
      commandName: "",
      listData: [],
      inputValue: ""
    };
  }

  componentWillMount() {
    this.backendData = remote.getGlobal("copalGUISharedData");

    ipc.on( "command-changed", ( sessionID, commandConfig ) => {
      this.currSessionID = sessionID;
      this.onCommandChange( commandConfig );
    } );

    ipc.on( "input-update", ( sessionID, dataAndMeta ) => {
      if( sessionID !== this.currSessionID ) {
        console.error( "Debug: sessionID does not match sessionID of currrent command", this.currSessionID, sessionID );
        return;
      }

      // we can safely ignore our own inputs
      if( dataAndMeta && dataAndMeta.sender === "copal-gui" )
        return;

      this.onCommandInputUpdate( dataAndMeta.data );

    } );

    ipc.on( "data-update", ( sessionID, dataAndMeta ) => {
      if( sessionID !== this.currSessionID ) {
        console.error( "Debug: sessionID does not match sessionID of currrent command", this.currSessionID, sessionID );
        return;
      }

      this.onDataUpdate( dataAndMeta.data );
    });

  }

  componentDidMount() {
    // React.findDOMNode( this.refs.list.focus() );
  }

  onCommandChange( commandConfig ) {
    this.setState( {
      commandName: commandConfig.name
    });

    this.refs.input.focus();
  }

  onCommandInputUpdate( inputData ) {

    var value = ( inputData && inputData.queryString ) || "";

    this.setState( {
      inputValue: value
    } );
  }

  onDataUpdate( data ) {
    this.setState( {
      listData: data
    } );
  }

  onInputChange( value ) {
    this.setState( {
        inputValue: value
      } );

    this.backendData.ipcCommandSessions[this.currSessionID].pushInput( value.trim() );
  }

  onInputChangeSpecial( value ) {
    var session = this.backendData.ipcCommandSessions[this.currSessionID];
    if( session.getNumSignalListeners("input-special") > 0 ) {
      session.pushInput( value.trim() );
    } else {
      // temporary hack: when no one listens to `input-special`, we'll focus on the list
      this.onInputExit();
    }
  }

  onItemExecute( item ) {
    this.backendData.ipcCommandSessions[this.currSessionID].pushIntoStream( "listitem-execute", { data: item, datatype: "listitem-title-url-icon" } );
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
          <button className="copal-main-command">{this.state.commandName}</button>
          <CopalInput ref="input"
                      className="copal-main-input"
                      value={ this.state.inputValue }
                      onChange={this.onInputChange.bind(this)}
                      onChangeSpecial={this.onInputChangeSpecial.bind(this)}
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
