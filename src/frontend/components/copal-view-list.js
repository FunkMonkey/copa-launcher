import React from "react";
import cx from "classnames"

import ReactComponentsListSelect from "react-components-list-select";

export default class CopalViewList extends React.Component {

  onItemExecute( index ) {
    this.props.onItemExecute( this.props.items[index] );
  }

  render() {


    // TODO: don't create an event-listener for every item
    var items = this.props.items.map( (item, index) => {
      return (
          <div key={item} >
            {item}
          </div>
        );
    });

    return (
      <ReactComponentsListSelect className="copal-view-list"
           onItemExecute={this.onItemExecute.bind(this)}
           tabIndex="1" >
        {items}
      </ReactComponentsListSelect>
    );

  }
}
