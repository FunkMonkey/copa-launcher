import React from "react";

export default React.createClass({

  onChange() {
    var value = React.findDOMNode(this.refs.input).value.trim();
    this.props.onChange( value );
  },

  // TODO: classnames
  render() {
    return (
      <input type="edit" ref="input" className={this.props.className} onChange={this.onChange} />
    );
  }
});
