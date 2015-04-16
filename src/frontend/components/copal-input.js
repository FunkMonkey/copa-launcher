import React from "react";
import keycode from "keycode";

export default class CopalInput extends React.Component {

  constructor( props ) {
    super( props );

    this.state = {
      value: props.value || ""
    };
  }

  componentWillReceiveProps( nextProps ) {
    if( typeof nextProps.value !== "undefined" )
      this.setState({value: nextProps.value});
  }

  focus() {
    React.findDOMNode(this.refs.input).focus();
  }

  onChange( event ) {
    this.setState({value: event.target.value});
    this.props.onChange( event.target.value );
  }

  onKeyDown( event ) {
    var key = keycode( event );

    switch( key ) {
      case "down":  this.props.onUserExit && this.props.onUserExit("down"); break;
      case "enter": this.props.onChangeSpecial && this.props.onChangeSpecial( event.target.value ); break;
    }
  }

  render() {

    return (
      <input type="edit"
             ref="input"
             value={this.state.value}
             className={this.props.className}
             onChange={this.onChange.bind(this)}
             onKeyDown={this.onKeyDown.bind(this)} />
    );
  }
}
