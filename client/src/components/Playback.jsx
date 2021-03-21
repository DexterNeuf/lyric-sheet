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
                albumImg: "",
                currentSongIndex: 0,
                albumHasChanged: true
        }
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
    

    // sets the array with the grabbed lyrics to state
    setStateTracks(newArray){
        this.setState({
            albumWithLyrics : newArray,
            albumHasChanged : true} , () =>{
                this.findSongIndex()
            });
        
    }
    //finds the index of the object with the same track number of whats store in state 
    findSongIndex(){
        let currentSongIndex = this.state.albumWithLyrics.findIndex((element) => element.trackNumber === this.state.trackNumber )
        this.setState({currentSongIndex: currentSongIndex},
        )
        
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

        for(let i = 0; i< this.state.albumLength; i++){
            options.title = this.state.album[i]
            getLyrics(options).then((lyrics) => {
                let track ={
                    trackTitle: this.state.album[i],
                    trackNumber: i + 1,
                    lyrics: lyrics,                    
                }
                newArray.push((track));
            });
        }; 
       
        setTimeout(() => {
           this.setStateTracks(newArray) 
        }, 1500);
        
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

    getCurrentlyPlaying(){

    fetch('https://api.spotify.com/v1/me/player/currently-playing',{
            headers: {'Authorization': 'Bearer ' + this.state.accessToken}
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
               
            })
        })

    }

    timer = () => {
        //check if song has change then updates the lyrics
        if (this.state.accessToken && this.state.albumWithLyrics){
        fetch('https://api.spotify.com/v1/me/player/currently-playing',{
            headers: {'Authorization': 'Bearer ' + this.state.accessToken}
        }).then(response => response.json())
        .then( data => {
            if(data.item.track_number !== this.state.trackNumber){
                this.setState({
                    trackNumber: data.item.track_number
                },()=>{
                    this.findSongIndex()
                })
            } 
            // check if album is different then grab new album info 
            if ( data.item.album.name !== this.state.albumName){
                this.setState({ 
                    albumHasChanged : false
                },() => {this.getCurrentlyPlaying()} )
    
            }
        })
        }
       
        // eventually have the time count up to 30 seconds to add to recently played

    }

    componentDidMount(){
        let parsed = queryString.parse(window.location.search);
        let accessToken = parsed.access_token;
        this.setState({accessToken: accessToken},  () =>{
            this.getCurrentlyPlaying();
            setInterval(this.timer, 3500);
        } )

        fetch('https://api.spotify.com/v1/me',{
            headers: {'Authorization': 'Bearer ' + accessToken}
        }).then(response => response.json())
        .then(data => this.setState({name:data.display_name})); 

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
    else if (this.state.albumWithLyrics[this.state.currentSongIndex] && this.state.albumHasChanged){
        return(
            <div className ="lyrics-wrapper">
                
                <p className="lyrics" > {this.state.albumWithLyrics[this.state.currentSongIndex].lyrics}</p>

                <div className="background" style={backgroundStyle}></div>
            </div>
        )
    }
     return(
         <div>
             loading
         </div>
     )
        }           
    }

export default Playback