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
                album: {},
                albumWithLyrics: {},
                albumImg: ""

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
            getLyrics(options).then((lyrics) => {
                let track ={
                    lyrics: lyrics,
                    trackNumber: i + 1
                }
                newArray.push((track));
            });
        }; 
       
        setTimeout(() => {
           
           this.setStateTracks(newArray) 
        }, 1500);
        
    }

    setStateTracks(newArray){
        
        this.setState({
            albumWithLyrics : newArray} , () =>{
            console.log(this.state.albumWithLyrics)
            });
    }

    resume(){

        fetch('https://api.spotify.com/v1/me/player/play', {
            method:'PUT',
            headers: {'Authorization': 'Bearer ' + this.state.accessToken}
        })  
        
    }
    pause(){

        fetch('https://api.spotify.com/v1/me/player/pause', {
            method:'PUT',
            headers: {'Authorization': 'Bearer ' + this.state.accessToken}
        })  

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
            albumId: data.item.album.id,
            albumImg:data.item.album.images[0].url }, () =>{
                this.getAlbumTrackList();
                console.log("this is the track number " + this.state.trackNumber)
            })
        })

    }

    timer(){
        console.log("new update")
    }
    componentDidMount(){
        let intervalId = setInterval(this.timer, 2000);
        let parsed = queryString.parse(window.location.search);
        let accessToken = parsed.access_token;
        this.setState({accessToken: accessToken})

        fetch('https://api.spotify.com/v1/me',{
            headers: {'Authorization': 'Bearer ' + accessToken}
        }).then(response => response.json())
        .then(data => this.setState({name:data.display_name})); 

        this.getCurrentlyPlaying(accessToken)
    }

    componentWillUnmount() {
        // use intervalId from the state to clear the interval
        clearInterval(this.intervalId);
     }
     
    render(){
    const backgroundStyle ={
        backgroundImage: 'url(' + this.state.albumImg +')'
    }

    if(this.state.albumWithLyrics.length === undefined){
    return(
    <main className="main-playback">
        <h1>Playback</h1>
            <p>{this.state.name}</p>
        <p onClick={() =>{this.pause()}}>pause</p><p onClick={() =>{this.resume()}}>play</p>
        <p>{this.state.trackName} - {this.state.trackArtist}</p>
    </main>
    )
    }
    else{
        return(
            <div className ="lyrics-wrapper">
                <p className="lyrics" > {this.state.albumWithLyrics[0].lyrics}</p>
                <div className="background" style={backgroundStyle}></div>
            </div>
        )
    }
        }           
    }

export default Playback