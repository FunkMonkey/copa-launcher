var CopalInput = React.createClass({

  onChange() {
    var value = React.findDOMNode(this.refs.input).value.trim();
    this.props.onChange( value );
  },

  render() {
    return (
      <input type="edit" ref="input" class="copal-input" onChange={this.onChange} />
    );
  }
});