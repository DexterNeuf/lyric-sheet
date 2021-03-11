import React from "react";
import { Switch, Route, Redirect, Link  } from "react-router-dom";
import  queryString from 'query-string'
import axios from "axios"

class Playback extends React.Component{
    constructor(){
        super();
        this.state = {
            name: "",
            accessToken: "",
                trackName: "",
                trackNumber: "",
                trackArist: "",
                albumName: "",
                albumId: "",
                albumLength: 0,
                album: {}
            
        }
    }
    resume(){
        fetch('https://api.spotify.com/v1/me/player/play', {
            method:'PUT',
            headers: {'Authorization': 'Bearer ' + this.state.accessToken}
        }).then(response => response.json())
    }
    pause(){
        fetch('https://api.spotify.com/v1/me/player/pause', {
            method:'PUT',
            headers: {'Authorization': 'Bearer ' + this.state.accessToken}
        }).then(response => response.json())
    }
    getAlbumTrackList(accessToken){
        axios.get(`https://api.spotify.com/v1/albums/1xFKfTChl3w1dNFukSKW2X/tracks`,{
            headers: {'Authorization': 'Bearer ' + accessToken}
        }).then(
           ((response)=>  {
            let newArray = []
            response.data.items.forEach(element => newArray.push(element.name))
            this.setState({album: newArray})
               console.log(this.state.album)
           })
        ).catch((error) => console.log(error));
    }

    getCurrentlyPlaying(accessToken){
    fetch('https://api.spotify.com/v1/me/player/currently-playing',{
            headers: {'Authorization': 'Bearer ' + accessToken}
        }).then(response => response.json())
        .then( data => {
            this.setState({ trackName:data.item.name,
            trackArist: data.item.album.artists[0].name,
            trackNumber: data.item.track_number,
            albumName: data.item.album.name,
            albumLength: data.item.album.total_tracks,
            albumId: data.item.album.id,})
            console.log(this.state.albumId)
        }).then(this.pause())
    }
    componentDidMount(){
        let parsed = queryString.parse(window.location.search);
        let accessToken = parsed.access_token;
        this.setState({accessToken: accessToken})

        fetch('https://api.spotify.com/v1/me',{
            headers: {'Authorization': 'Bearer ' + accessToken}
        }).then(response => response.json())
        .then(data => this.setState({name:data.display_name})); 


        this.getCurrentlyPlaying(accessToken)
        this.getAlbumTrackList(accessToken)
    }
    render(){
    return(
    <div>
        <h1>Playback Works</h1>
            <p>{this.state.name}</p>
        <p onClick={() =>{this.pause()}}>pause</p><p onClick={() =>{this.resume()}}>play</p>
        <p>{this.state.trackName} - {this.state.trackArist}</p>
    </div>
    )
}           
    }

export default Playback