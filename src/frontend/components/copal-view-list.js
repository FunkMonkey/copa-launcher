var CopalViewList = React.createClass({

  onItemClick( item ) {
    this.props.onItemExecute( item );
  },

  render() {
   
    var items = this.props.items.map( item =>  {
      return (
        <div onClick={this.onItemClick.bind(this, item)}>
          {item}
        </div>
      );
    });
    
    return (
      <div className="copal-view-list">
        {items}
      </div>
    );

  }
});