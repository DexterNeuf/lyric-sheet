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
                intialRun: true,
                isPlaying: false,
                pausedCounter: 0 ,
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
            console.log(data)
            this.setState({ 
            isPlaying : data.is_playing,
            trackName:data.item.name,
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
        //keep lyrics paused if app is started with playback state of paused
        if (this.state.intialRun && this.state.albumWithLyrics){
                fetch('https://api.spotify.com/v1/me/player/currently-playing',{
                    headers: {'Authorization': 'Bearer ' + this.state.accessToken}
                }).then(response => response.json())
                .then( data =>{
                    if (data.is_playing === true){
                        this.setState({
                            intialRun: false
                        })
                    }
                })   
        }
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
                // if (data.is_playing === false){
                //     this.setState({
                //         pausedCounter: ++
                //     })
                // }
            } 
            // check if album is different then grab new album info 
            if ( data.item.album.name !== this.state.albumName){
                this.setState({ 
                    albumHasChanged : false
                },() => {this.getCurrentlyPlaying()} )
    
            }
        }).catch((error) => console.log(error))
        }
       
        // eventually have the time count up to 30 seconds to add to recently played

    }

    componentDidMount(){
        let parsed = queryString.parse(window.location.search);
        let accessToken = parsed.access_token;
        this.setState({accessToken: accessToken,},  () =>{
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

    if(this.state.albumWithLyrics.length === undefined || (this.state.isPlaying === false && this.state.intialRun === true) || this.state.pausedCounter === 5){
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
     else{
     return(
         <div>
             loading
             {this.state.albumHasChanged === false && <p>
                 it is false
                 </p>}
                 {this.state.albumHasChanged === true && <p>
                 it is true
                 {this.setState({
                     albumHasChanged : false
                 }, () => {
                     this.sendTracks()
                 })}
                 </p>}
         </div>
     )
    }
        }           
    }

export default Playback