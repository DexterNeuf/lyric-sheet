import React from "react";
import { Switch, Route, Redirect, Link  } from "react-router-dom";
import  queryString from 'query-string'
import axios from "axios"
import { getLyrics, getSong } from 'genius-lyrics-api';

class Playback extends React.Component{
    constructor(){
        super();
        this.state = {
            name: "",
            accessToken: "",
                trackName: "",
                trackNumber: "",
                trackArtist: "",
                albumName: "",
                albumId: "",
                albumLength: 0,
                album: {}
        }
    }

    sendTracks(){
        let newArray = [];
        let gotLyrics = "";
        let options = {
            apiKey: 'Nd9cZuvDxu-q2mvaGXVxV7LKZFrrNGkuufZwGEFM9QNDzHNwTZOZUUKAd6fI9aps',
            title: "",
            artist: this.state.trackArtist,
            optimizeQuery: true
        };
        console.log(this.state.album[0])
        for(let i = 0; i< this.state.albumLength; i++){
            options.title = this.state.album[i]
            getLyrics(options).then((lyrics) => {newArray.push(lyrics)
            });
        }
        setTimeout(function(){console.log(newArray[0]); }, 5000 )

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
    getAlbumTrackList(){

        axios.get(`https://api.spotify.com/v1/albums/${this.state.albumId}/tracks`,{
            headers: {'Authorization': 'Bearer ' + this.state.accessToken}
        }).then(
           ((response)=>  {
            let newArray = []
            response.data.items.forEach(element => newArray.push(element.name))
            this.setState({album: newArray
                },() => {
                    this.sendTracks();
                    })
           })
           
        ).catch((error) => console.log(error));

    }

    getCurrentlyPlaying(accessToken){

    fetch('https://api.spotify.com/v1/me/player/currently-playing',{
            headers: {'Authorization': 'Bearer ' + accessToken}
        }).then(response => response.json())
        .then( data => {
            this.setState({ trackName:data.item.name,
            trackArtist: data.item.album.artists[0].name,
            trackNumber: data.item.track_number,
            albumName: data.item.album.name,
            albumLength: data.item.album.total_tracks,
            albumId: data.item.album.id}, () =>{
                this.getAlbumTrackList();
            })
        })

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
    }
    render(){
    return(
    <main className="main-playback">
        <h1>Playback</h1>
            <p>{this.state.name}</p>
        <p onClick={() =>{this.pause()}}>pause</p><p onClick={() =>{this.resume()}}>play</p>
        <p>{this.state.trackName} - {this.state.trackArtist}</p>
    </main>
    )
}           
    }

export default Playback