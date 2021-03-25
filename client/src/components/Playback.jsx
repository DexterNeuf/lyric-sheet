import React from "react";
import  queryString from 'query-string'
import axios from "axios"
import { getLyrics} from 'genius-lyrics-api';
import {IconContext} from "react-icons";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { IoMdSkipBackward, IoMdSkipForward } from "react-icons/io";
import { IoPauseCircleOutline, IoPlayCircleOutline} from "react-icons/io5";
import styled from "styled-components";


const backend = "http://localhost:8888/user/"



class Playback extends React.Component{
    constructor(){
        super();
    
        this.state = {
            id: "",
            name: "",
            accessToken: "",
            favouriteAlbums: [],
            recentAlbums: [],
            intialRun: true,
            isPlaying: false,
            pausedCounter: 0 ,
            recentCounter: 0,
            trackName: "",
            trackNumber: "",
            trackArtist: "",
            albumName: "",
            albumId: "",
            albumLength: 0,
            albumLink:"",
            album: {},
            albumWithLyrics: {},
            albumImg: "",
            currentSongIndex: 0,
            albumHasChanged: true,
            Lyricswrapper : ""
        }
    }

    resume(){

        fetch('https://api.spotify.com/v1/me/player/play', {
            method:'PUT',
            headers: {'Authorization': 'Bearer ' + this.state.accessToken}
        }).then(
            this.setState({
                isPlaying: true
            })
        )
        
    }
    pause(){

        fetch('https://api.spotify.com/v1/me/player/pause', {
            method:'PUT',
            headers: {'Authorization': 'Bearer ' + this.state.accessToken}
        }).then(
            this.setState({
                isPlaying: false
            })
        )

    }
    nextTrack(){
        fetch('https://api.spotify.com/v1/me/player/next', {
            method:'POST',
            headers: {'Authorization': 'Bearer ' + this.state.accessToken}
        })
    }
    previousTrack(){
        fetch('https://api.spotify.com/v1/me/player/previous', {
            method:'POST',
            headers: {'Authorization': 'Bearer ' + this.state.accessToken}
        })
    }
    getUserFavouriteAlbums(){
        axios.get( backend +"favourites/"+ this.state.id).then((res) => {
            this.setState({
                favouriteAlbums: res.data
            })
        })
    }
    getUserRecentAlbums(){
        axios.get( backend + "recent/"+ this.state.id).then((res) => {
            this.setState({
                recentAlbums: res.data
            })
        })
    }
    favouriteAlbum(){
        const data = {
            album : this.state.albumName,
            albumImg : this.state.albumImg,
            albumArtist : this.state.trackArtist,
            albumLink : this.state.albumLink
        }
        axios.post(backend + "favourite/" + this.state.id, data)
        .then((response) => {
            console.log(response)
            this.getUserFavouriteAlbums();
        })
    }
    recentAlbum(){
        const data = {
            album : this.state.albumName,
            albumImg : this.state.albumImg,
            albumArtist : this.state.trackArtist,
            albumLink : this.state.albumLink
        }
        axios.post(backend + "recent/" + this.state.id, data)
        .then((response) => {
            console.log(response)
        })
    }
    // sets the array with the grabbed lyrics to state
    setStateTracks(newArray){
        this.setState({
            albumWithLyrics : newArray,
            albumHasChanged : true,
            Lyricswrapper: styled.div`
            display: flex;
            justify-content: center;
            overflow-wrap: break-word;
            min-height: 100vh;
            z-index: 999;
            p{
                overflow-wrap: break-word;
                word-break: break-word;
                margin: 0
            }
            ::before {
                content: "";
                position: fixed;
                left: 0;
                right: 0;
                z-index: 1;
                display: block;
                background-image: url('${this.state.albumImg}');
                height: 100vh;
                 background-size: cover;
                background-position: center center;
                filter: blur(5.5em) opacity(0.6);
            }
            }
          `} , () =>{
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
            this.setState({ 
            isPlaying : data.is_playing,
            trackName:data.item.name,
            trackArtist: data.item.album.artists[0].name,
            trackNumber: data.item.track_number,
            albumName: data.item.album.name,
            albumLength: data.item.album.total_tracks,
            albumId: data.item.album.id,
            albumImg:data.item.album.images[0].url,
            albumLink:data.item.album.external_urls.spotify }, () =>{
                this.getAlbumTrackList();
            })
        }).catch((error) => console.log(error))

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
            } 
            if (this.state.intialRun === false && data.is_playing === false && this.state.pausedCounter < 5){
                this.setState({
                        pausedCounter: (this.state.pausedCounter + 1)
                    })
            }
            // when the playback is paused resets paused counter so render can contine
            if (data.is_playing === true && this.state.pausedCounter >= 5){
                this.setState({
                    pausedCounter : 0
                })
            }
            // check if album is different then grab new album info 
            if ( data.item.album.name !== this.state.albumName){
                this.setState({ 
                    albumHasChanged : false
                },() => {this.getCurrentlyPlaying()} )
                // album has changed and previously album was added to backend reset so newer albums and be recently played
                if(this.state.recentCounter >= 10){
                    this.setState({
                        recentCounter : 0
                    })
                }
            //checks track if the same album has been playing then adds to recently played in backend
            }else if(this.state.recentCounter < 10 && !this.state.intialRun ){
                this.setState({
                    recentCounter: (this.state.recentCounter + 1)
                },()=>{
                    if(this.state.recentCounter === 10 ){
                        this.recentAlbum()
                    }
                })
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
        .then(data => this.setState({
            name:data.display_name,
            id: data.id
        },() => {
            this.getUserFavouriteAlbums()
            this.getUserRecentAlbums()
        })); 

    }


     
    render(){
    const backgroundStyle ={
        backgroundImage: 'url(' + this.state.albumImg +')'
    }
    //makes div's for rendering favourite albums
    let newFavourite = "";
    let newRecent = "";
    let isAlbumFavourited = this.state.favouriteAlbums.find(e => e.album === this.state.albumName)
    

    if (this.state.favouriteAlbums.length !== 0){
        newFavourite = this.state.favouriteAlbums.map((ele) => {
            return(
            <div className="album">
                <a href={ele.albumLink} target="_blank" rel="noopener noreferrer">
            <img src={ele.albumImg} alt="album cover"/>
            <div className="album__text">
                <h2>{ele.album}</h2>
                <p>{ele.albumArtist}</p>
            </div>
            </a>
        </div>
        )
        }) 
    }
    //makes div's for rendering recently played albums
    
    if (this.state.recentAlbums.length !== 0){
        newRecent = this.state.recentAlbums.map((ele) => {
            return(
            <div className="album">
            <a href={ele.albumLink} target="_blank" rel="noopener noreferrer">
            <img src={ele.albumImg} alt="album cover"/>
            <div className="album__text">
                <h2>{ele.album}</h2>
                <p>{ele.albumArtist}</p>
            </div>
            </a>
        </div>
        )
        }) 
    }
    //makes 
    if(this.state.albumWithLyrics.length === undefined || (this.state.isPlaying === false && this.state.intialRun === true) || this.state.pausedCounter === 5){
    return(
    <main className="main-playback">
        <h1>Your Favourites</h1>
                <div className="album-wrapper">{newFavourite}</div>
        <h1>Your recently played </h1>
                <div className="album-wrapper">{newRecent}</div>
        <p onClick={() =>{this.pause()}}>pause</p><p onClick={() =>{this.resume()}}>play</p>
    </main>
    )
    }
    else if (this.state.albumWithLyrics[this.state.currentSongIndex] && this.state.albumHasChanged){
        return(
            <div>
             <this.state.Lyricswrapper>
             <p className="lyrics" > {this.state.albumWithLyrics[this.state.currentSongIndex].lyrics}
                </p>
             </this.state.Lyricswrapper>
            <div className="playback-bar">
                <div className="playback-bar__first">
                </div>
                <div className="playback-bar__controls">
                    <span onClick={() =>{this.previousTrack()}}>
                    <IoMdSkipBackward/>
                    </span> 
                    <IconContext.Provider value={{ size: "3em"}}>
                    {this.state.isPlaying ?
                    <span onClick={() =>{this.pause()}}>
                    <IoPlayCircleOutline />
                    </span>
                    : <span onClick={() =>{this.resume()}}>
                    <IoPauseCircleOutline/>
                    </span>
                    }</IconContext.Provider>
                    <span onClick={() =>{this.nextTrack()}}>
                    <IoMdSkipForward/>
                    </span>
                </div>
                <div className="playback-bar__last">
                <IconContext.Provider value={{ size: "1.75em" , className: 'react-icons' }}>
                {!isAlbumFavourited ?
                <span onClick={() =>{this.favouriteAlbum()}}>
                    <AiOutlineHeart/>
                </span>
                :
                <AiFillHeart/>
                }
                </IconContext.Provider>
            </div>
         </div>
        </div>
        )
    }
     else{
     return(
         <div>
             <div className="loading">
             {this.state.albumHasChanged === false && <div className="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>}
                 {this.state.albumHasChanged === true && <div className="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
                 {this.setState({
                     albumHasChanged : false
                 }, () => {
                    setTimeout(() => { this.getCurrentlyPlaying(); }, 250);
                 })}
                 </div>}
                </div>
         </div>
     )
    }
        }           
    }

export default Playback