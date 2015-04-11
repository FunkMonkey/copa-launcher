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

    ipc.on( "input-update", ( sessionID, inputData, metaData ) => {

      // we can safely ignore our own inputs
      if( metaData && metaData.sender === "copal-gui" )
        return;

      this.onCommandInputUpdate( inputData, metaData );

    } );

    ipc.on( "data-update", ( sessionID, data ) => {
      this.currSessionID = sessionID;
      this.onDataUpdate( data );
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
    this.backendData.commandSessions[this.currSessionID].dispatchInput( value.trim() );
  }

  onItemExecute( item ) {
    this.backendData.commandSessions[this.currSessionID].dispatchSignal( "listitem-execute", item, { datatype: "listitem-title-url-icon" } );
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
