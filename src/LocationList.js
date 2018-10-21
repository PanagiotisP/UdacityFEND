import React, { Component } from 'react'
import ListItem from './ListItem'
import { locations } from './data/data.js';

class LocationList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedOption: 'everything',
      locationList: locations,
      visibleMarkers: [],
      markersList: []
    }
  }

  /* this is called once to ensure that visibleMarkers will have
  a default value of all markers and that the list will be correct */
  componentDidMount() {
    this.populateMap()
  }

  populateMap() {
    /* markers contain the location's information */
    let markersList = this.state.locationList.map(location => {
      let googleMarker = new window.google.maps.Marker({
        title: location.name,
        position: location.pos,
        type: location.type,
        map: this.props.map,
        animation: window.google.maps.Animation.DROP,
      })

      /* When clicked, show info window */
      googleMarker.addListener('click', () => {
        if (this.props.map.getZoom() < 16) {
          this.props.map.setZoom(16)
        }
        this.props.map.panTo(googleMarker.getPosition())
        this.props.showInfoWindow(googleMarker)
      })
      return googleMarker
    })
    this.setState({ markersList: markersList, visibleMarkers: markersList })
    console.log('mphka init')
  }

  /* On selection change filter markers, update state and resize map */
  handleOptionChange = (changeEvent) => {
    this.props.closeInfoWindow()
    let visibleMarkers = this.filterMarkers(changeEvent.target.value)
    this.setState({
      selectedOption: changeEvent.target.value,
      visibleMarkers: visibleMarkers
    })
    this.resizeMap(visibleMarkers)
  }

  /* Adjust markers' visibility by type */
  filterMarkers = (selectedOption) => {
    return this.state.markersList.filter(marker => {
      if (selectedOption === 'everything') {
        marker.setVisible(true)
        return marker
      }
      else if (marker.type !== selectedOption) {
        marker.setVisible(false)
      }
      else {
        marker.setVisible(true)
        return marker
      }
    })
  }

  /* Fit map to the visible markers */
  resizeMap = (markersList) => {
    if (window.google) {
      let bounds = new window.google.maps.LatLngBounds()
      markersList.forEach(marker => {
        bounds.extend(marker.position)
      })
      this.props.map.fitBounds(bounds)
    }
  }

  render() {
    return (
      /* This radio button implementation was inspired by http://react.tips/radio-buttons-in-reactjs/ */
      <div>
        <form className='filter' role='filter'>
          <div id='choose'>Choose what to display</div>
          <select aria-labelledby='choose' onChange={this.handleOptionChange} tabIndex={this.props.navOpened ? 0 : -1} className='dropdown'>
            <option value='everything' checked={this.state.selectedOption === 'everything'} >
              Everything
            </option>
            <option value='church' checked={this.state.selectedOption === 'church'}>
              Churches
            </option>
            <option value='museum' checked={this.state.selectedOption === 'museum'}>
              Museums
            </option>
            <option value='aquarium' checked={this.state.selectedOption === 'aquarium'}>
              Aquarium
            </option>
            <option value='point_of_interest' checked={this.state.selectedOption === 'point_of_interest'}>
              Points of interest
            </option>
          </select>
        </form >
        <ol className='list' role='list'>
          {this.state.visibleMarkers.map(marker => (
            <li
              role='listitem'
              key={marker.title}>
              <ListItem
                navOpened={this.props.navOpened}
                map={this.props.map}
                marker={marker}
                closeInfoWindow={this.props.closeInfoWindow}
                showInfoWindow={this.props.showInfoWindow} />
            </li>
          ))}
        </ol>
      </div >
    )
  }
}
export default LocationList