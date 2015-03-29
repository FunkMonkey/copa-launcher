import React from "react";
import keycode from "keycode";

export default class CopalInput extends React.Component {

  onChange() {
    var value = React.findDOMNode(this.refs.input).value.trim();
    this.props.onChange( value );
  }

  onKeyDown( event ) {
    var key = keycode( event );

    switch( key ) {
      case "down": this.props.onUserExit && this.props.onUserExit("down"); break;
    }
  }

  // TODO: classnames
  render() {
    return (
      <input type="edit"
             ref="input"
             className={this.props.className}
             onChange={this.onChange.bind(this)}
             onKeyDown={this.onKeyDown.bind(this)} />
    );
  }
}
