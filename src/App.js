import React, { Component } from 'react';
import './App.css';

// Components
import Navigation from './components/navigation/Navigation'
import Logo from './components/logo/Logo'
import ImageLinkForm from './components/image-link-form/ImageLinkForm'
import SignIn from './components/signin/SignIn'
import Register from './components/register/Register'
import Rank from './components/rank/Rank'
import FaceRecognition from './components/face-recognition/FaceRecognition'
import Particles from 'react-particles-js';


const particlesOptions = {
  particles: {
    number: {
      value: 200,
      density: {
        enable: true,
        value_area: 800
      }   
    }    
  },
  interactivity: {
    events: {
      onhover: {
        enable: true,
        mode: 'repulse'
      },   
    }         
  }    
}

const initialState = {
  input: '',
  imageUrl:'',
  box: {},
  route: 'signIn',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {

  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl:'',
      box: {},
      route: 'signIn',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

  calculateFaceLocation = (data) => {
    const clarifaiface = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiface.left_col * width,
      topRow: clarifaiface.top_row * height,
      rightCol: width - (clarifaiface.right_col * width),
      bottomRow:  height - (clarifaiface.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box : box})
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  onInputChange = (event) => {
    this.setState({ input : event.target.value});
  } 
  
  onButtonSubmit = () => {
    this.setState({imageUrl : this.state.input})
    fetch('https://whispering-shore-50316.herokuapp.com/imageurl', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body:JSON.stringify({
        input: this.state.input,
      })
    })
    .then(response => response.json())
    .then(response => {
      fetch('https://whispering-shore-50316.herokuapp.com/image', {
      method: 'put',
      headers: {'Content-Type': 'application/json'},
      body:JSON.stringify({
        id: this.state.user.id,
      })
      })
      .then(response => response.json())
      .then(count => {
        if (count){
          this.setState(Object.assign(this.state.user, {entries : count}))
        }
        else {
          console.log("Error")
        }
      })
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(err => console.log(err));
  }
  
  onRouteChange = (r) => {
    if(r === 'signOut') 
    {
      this.setState(initialState)
    } 
    else if ( r === 'home') 
    {
      this.setState({isSignedIn : true})
    }

    this.setState({ route : r})
  }

  render() {
    return (
      <div className="App">
        <Particles className="particles" params={particlesOptions} />
        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange} />
        {
          this.state.route === 'home'
          ? <> 
            <Logo />
            <Rank name={this.state.user.name} entries={this.state.user.entries} />
            <ImageLinkForm 
              onInputChange={this.onInputChange} 
              onButtonSubmit={this.onButtonSubmit} 
            />
            <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl} />
          </>          
          : (
            this.state.route === 'signIn'
            ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          )
        }        
      </div>
    );
  }  
}

export default App;
