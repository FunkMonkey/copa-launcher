import React from "react";
import cx from "classnames"

import ReactComponentsListSelect from "react-components-list-select";

export default class CopalViewList extends React.Component {

  constructor( props ) {
    super( props );

    this.state = {
    };
  }

  onItemExecute( index ) {
    this.props.onItemExecute( this.props.items[index] );
  }

  selectFirst() {
    this.refs.list._selectIndex( 0 );
  }

  render() {


    // TODO: don't create an event-listener for every item
    var items = this.props.items.map( (item) => {
      var title = ( typeof item === "string" ) ? item : item.title;

      return (
          <div key={title} >
            {title}
          </div>
        );
    });

    return (
      <ReactComponentsListSelect
          ref="list"
          className="copal-view-list"
          tabIndex="1"
          onItemExecute={this.onItemExecute.bind(this)} >
        {items}
      </ReactComponentsListSelect>
    );

  }
}
