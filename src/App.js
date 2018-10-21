import React, { Component } from 'react'
import scriptLoader from 'react-async-script-loader';
import './App.css'
import LocationList from './LocationList'


class App extends Component {
  constructor() {
    super()
    this.sideNavWidth = 0
    this.state = {
      map: {},
      infoWindow: {},
      currentMarker: '',
      navOpened: false,
      mapSuccess: false,
      mapError: false
    }
    this.gm_authFailure = this.gm_authFailure.bind(this)
    this.initMap = this.initMap.bind(this)
    this.showInfoWindow = this.showInfoWindow.bind(this)
    this.closeInfoWindow = this.closeInfoWindow.bind(this)
  }

  componentDidMount() {
    /* called once at the beginning and then on resize */
    window.addEventListener('resize', this.resizeEverything)
    window.gm_authFailure = this.gm_authFailure
    this.resizeEverything()
  }

  gm_authFailure() {
    this.setState({ mapError: true })
  }
  /* Correct side nav's width and position */
  resizeEverything = () => {
    if (window.innerWidth > 1020) {
      this.sideNavWidth = '306px'
    }
    else if (window.innerWidth <= 660) {
      this.sideNavWidth = '198px'
    }
    else {
      this.sideNavWidth = '30%'
    }
    if (document.getElementById('map')) {
      document.getElementById('map').style.height = window.innerHeight - document.querySelector('.appTitle').offsetHeight + 'px'
    }
    document.getElementById('mySidenav').style.width = this.sideNavWidth
    if (document.getElementById('mySidenav').offsetLeft < 0) {
      document.getElementById('mySidenav').style.left = '-' + this.sideNavWidth
    }
  }

  componentWillReceiveProps({ isScriptLoadSucceed }) {
    // Check if script is loaded and if map is defined
    if (isScriptLoadSucceed && !this.state.mapSuccess && navigator.onLine) {
      this.initMap()
    } else if (!this.state.mapSuccess) {
      console.log("Map did not load");
      this.setState({ mapError: true });
    }
  }

  /* Initialize and add the map, the markers and the info winodw */
  initMap() {
    let mapWindow = document.getElementById('map')
    let map = new window.google.maps.Map(mapWindow, { zoom: 13, center: { lat: 35.339144, lng: 25.193199 } })

    /* event listener to close info window */
    map.addListener('click', () => {
      this.closeInfoWindow()
    })

    let infoWindow = new window.google.maps.InfoWindow()
    infoWindow.addListener('closeclick', () => {
      this.closeInfoWindow()
    })
    this.setState({ map: map, infoWindow: infoWindow, mapSuccess: true })
  }

  /* Stop current marker's animation, clear and close info window */
  closeInfoWindow = () => {
    if (this.state.currentMarker) {
      this.state.currentMarker.setAnimation(null)
    }
    this.setState({ currentMarker: '' })
    this.state.infoWindow.setContent('')
    this.state.infoWindow.close()
  }

  /* On different marker, close opened info window, animate marker and get location's details 
  On same marker do nothing  */
  showInfoWindow = (marker) => {
    if (marker !== this.state.currentMarker) {
      this.closeInfoWindow()
      this.setState({ currentMarker: marker })
      this.state.infoWindow.setContent('<strong>Loading data</strong>')
      this.state.infoWindow.open(this.state.map, marker)
      marker.setAnimation(window.google.maps.Animation.BOUNCE)
      this.getLocationDetails(marker)
    }
  }

  /* Get location's data, if it exists, from wikipedia */
  getLocationDetails = (marker) => {
    let self = this
    const proxyurl = 'https://cors-anywhere.herokuapp.com/'
    let pageid
    let url = 'https://en.wikipedia.org/w/api.php?format=json&action=query&formatversion=2&prop=pageimages|pageterms&titles=' + marker.title
    let content
    fetch(proxyurl + url)
      .then(
        (response) => response.json())
      .then(response => {
        content = '<h3>' + marker.title + '</h3>'
        if (response.query.pages[0].thumbnail) {
          content += '<img src="' + response.query.pages[0].thumbnail.source.replace('50px', '360px') + '" alt="photo of "' + marker.title + '">'
        }
        if (!response.query.pages[0].missing) {
          pageid = response.query.pages[0].pageid
          url = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=info&pageids=' + pageid + '&inprop=url'
          fetch(proxyurl + url)
            .then((response) => response.json())
            .then(response => {
              content += '<br><a href=' + response.query.pages[pageid].fullurl + ' target="_blank">Read more on Wikipedia</a>'
              /* avoid asynchronous update to wrong marker */
              let pos1 = marker.getPosition()
              let pos2 = self.state.infoWindow.getPosition()
              if (pos1 === pos2) {
                self.state.infoWindow.setContent(content)
              }
            })
        }
        else {
          /* avoid asynchronous update to wrong marker */
          let pos1 = marker.getPosition()
          let pos2 = self.state.infoWindow.getPosition()
          if (pos1 === pos2) {
            self.state.infoWindow.setContent(content)
          }
        }
      })
      .catch((err) => {
        console.log(err)
        self.state.infoWindow.setContent("Sorry data can't be loaded")
      })
  }

  /* inspired by w3 schools https://www.w3schools.com/howto/howto_js_sidenav.asp */
  openNav = () => {
    this.setState({ navOpened: true })
    document.getElementById('mySidenav').style.left = '0'
  }

  closeNav = () => {
    this.setState({ navOpened: false })
    document.getElementById('mySidenav').style.left = '-' + this.sideNavWidth
  }

  render() {
    return (
      <div className='App' role='main'>
        <header className='appTitle'>
          <h1>Heraklion Sites</h1>
        </header>
        <button tabIndex={this.state.navOpened ? -1 : 0} className='hamburger' onClick={this.openNav} role='menu' aria-label='open menu'>&#9776;</button>
        <aside id='mySidenav' className='listcontainer'>
          <button className='closebtn' aria-label='close menu' tabIndex={this.state.navOpened ? 0 : -1} onClick={this.closeNav}>&times;</button>
          {this.state.mapSuccess && !this.state.mapError ?
            <LocationList
              map={this.state.map}
              mapSuccess={this.state.mapSuccess}
              closeInfoWindow={this.closeInfoWindow}
              showInfoWindow={this.showInfoWindow}
              navOpened={this.state.navOpened} />
            : <p className="error" role='alert'>
              Google Maps did not load. Please check your internet connection or contact site's administrator
            </p>
          }
        </aside>
        {this.state.mapError ?
          <section className="error" role='alert'>
            Google Maps did not load. Please check your internet connection or contact site's administrator
          </section>
          : <section role="application" aria-label='map' id='map'>
          </section>
        }
      </div>
    )
  }
}

export default scriptLoader(
  'https://maps.googleapis.com/maps/api/js?key=AIzaSyBFeS_eMqlLcKCzPtTj-L6RsN0s17Bul9Y'
)(App)