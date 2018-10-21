import React, { Component } from 'react'

class ListItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            marker: this.props.marker,
        }
    }
    /* On click focus on marker and open info window */
    centerMarker = (event) => {
        event.preventDefault();
        this.props.showInfoWindow(this.state.marker)
        this.props.map.setCenter(this.state.marker.getPosition())
        this.props.map.setZoom(19)
    }

    render() {
        return (
            <button className='items' tabIndex={this.props.navOpened ? 0 : -1} onClick={this.centerMarker}>
                {this.state.marker.title}
            </button>
        )
    }
}
export default ListItem