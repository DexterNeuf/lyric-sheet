const express = require('express')
const request = require('request')
const querystring = require('querystring')
const dotenv = require('dotenv')
const { default: axios } = require('axios')
const getLyrics = 'genius-lyrics-api';
const fs = require("fs");
const addRequestId = require("express-request-id")();
const { v4: uuidv4 } = require("uuid");
var bodyParser = require("body-parser");
var multer = require("multer");
var forms = multer();


const app = express()
app.use(addRequestId);

app.use(bodyParser.json());
app.use(forms.array());
app.use(bodyParser.urlencoded({ extended: true }));

const redirect_uri = 
  process.env.REDIRECT_URI || 
  'http://localhost:8888/callback'

app.get('/login', function(req, res) {
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: 'user-read-private user-read-email user-read-currently-playing user-modify-playback-state',
      redirect_uri
    }))
})

app.get('/callback', function(req, res) {
  let code = req.query.code || null
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer.from(
        process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
      ).toString('base64'))
    },
    json: true
  }
  request.post(authOptions, function(error, response, body) {
    var access_token = body.access_token
    let uri = process.env.FRONTEND_URI || 'http://localhost:3000/playback'
    res.redirect(uri + '?access_token=' + access_token)
  })
});

app.get('/playback', function(req, res){
  let options ={
  apiKey: process.env.GENUIS_TOKEN,
	title: 'Blinding Lights',
	artist: 'The Weeknd',
	optimizeQuery: true
  }
  getLyrics(options).then((lyrics) => console.log(lyrics));
  res.json(lyrics)
})


app.post('/user/:id', function(req, res){
  const readFile = (fs.readFileSync("./data/users.json", "utf8"));
  const oldJson = JSON.parse(readFile)
  const existingUserIndex = oldJson.findIndex((e)=> e.id === req.params.id) 
  if(existingUserIndex !== -1){
    const existingAlbumIndex = oldJson[existingUserIndex].favAlbums.findIndex((e)=> e.album.toUpperCase() === req.body.album.toUpperCase())
    //adds album if it doesn't exist
    if(existingAlbumIndex === -1){
      const newFavAlbum = {
        album : req.body.album,
        albumImg : req.body.albumImg,
        albumArtist : req.body.albumArtist
      }
      //pushs to fav album array
      oldJson[existingUserIndex].favAlbums.push(newFavAlbum);
      fs.writeFileSync("./data/users.json", JSON.stringify(oldJson), "utf-8")
      res.json('fav albuma added')
      }else{
        res.json("album already favourited");
      }
    }else{
      //create new user
      let x = { 
        id: req.params.id ,
        favAlbums: [
          {
            album : req.body.album,
        albumImg : req.body.albumImg,
        albumArtist : req.body.albumArtist
          }
        ]
      }
      oldJson.push(x);
      fs.writeFileSync("./data/users.json", JSON.stringify(oldJson), "utf-8")
      res.json('user added')
    }
  
  // console.log(xParse.findIndex((e)=> e.id === "123")) 
})
let port = process.env.PORT || 8888
console.log(`Listening on port ${port}. Go /login to initiate authentication flow.`)
const result = dotenv.config()


console.log(result.parsed)
app.listen(port)