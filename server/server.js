
const express = require('express')
const request = require('request')
const querystring = require('querystring')
const dotenv = require('dotenv')
const fs = require("fs");
const addRequestId = require("express-request-id")();
const bodyParser = require("body-parser");
const multer = require("multer");
const forms = multer();
const cors = require('cors')
const app = express()



app.use(cors())

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



app.get('/user/favourites/:id', function(req, res){
  const readFile = (fs.readFileSync("./data/users.json", "utf8"));
  const oldJson = JSON.parse(readFile)
  const existingUserIndex = oldJson.findIndex((e)=> e.id === req.params.id)
  JSON.stringify(oldJson[existingUserIndex].favAlbums)
  res.json(oldJson[existingUserIndex].favAlbums) 
});

app.get('/user/recent/:id', function(req, res){
  const readFile = (fs.readFileSync("./data/users.json", "utf8"));
  const oldJson = JSON.parse(readFile)
  const existingUserIndex = oldJson.findIndex((e)=> e.id === req.params.id)
  JSON.stringify(oldJson[existingUserIndex].recentAlbums)
  res.json(oldJson[existingUserIndex].recentAlbums) 
});

app.post('/user/favourite/:id', function(req, res){
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
        albumArtist : req.body.albumArtist,
        albumLink : req.body.albumLink,
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
      let pushFavAlbum = { 
        id: req.params.id ,
        favAlbums: [
          {
        album : req.body.album,
        albumImg : req.body.albumImg,
        albumArtist : req.body.albumArtist,
        albumLink : req.body.albumLink
          }
        ],
        recentAlbums: [],
      }
      oldJson.push(pushFavAlbum);
      fs.writeFileSync("./data/users.json", JSON.stringify(oldJson), "utf-8")
      res.json('user added')
    }
})
app.post('/user/recent/:id', function(req, res){
  const readFile = (fs.readFileSync("./data/users.json", "utf8"));
  const oldJson = JSON.parse(readFile);
  const existingUserIndex = oldJson.findIndex((e)=> e.id === req.params.id) 
  // checks if user exicts
  if(existingUserIndex !== -1){
    const existingAlbumIndex = oldJson[existingUserIndex].recentAlbums.findIndex((e)=> e.album.toUpperCase() === req.body.album.toUpperCase())
    //album doesn't exist
  if(existingAlbumIndex === -1){
    if(oldJson[existingUserIndex].recentAlbums.length === 3){
      const newFavAlbum = {
        album : req.body.album,
        albumImg : req.body.albumImg,
        albumArtist : req.body.albumArtist,
        albumLink : req.body.albumLink
      }
      oldJson[existingUserIndex].recentAlbums.unshift(newFavAlbum);
      oldJson[existingUserIndex].recentAlbums.pop(newFavAlbum)
      console.log(oldJson[existingUserIndex].recentAlbums)
      fs.writeFileSync("./data/users.json", JSON.stringify(oldJson), "utf-8")
      res.json('album added')
    }else if(oldJson[existingUserIndex].recentAlbums.length < 3){
      const newFavAlbum = {
        album : req.body.album,
        albumImg : req.body.albumImg,
        albumArtist : req.body.albumArtist,
        albumLink : req.body.albumLink
      }
      oldJson[existingUserIndex].recentAlbums.unshift(newFavAlbum)
      fs.writeFileSync("./data/users.json", JSON.stringify(oldJson), "utf-8")
      res.json('album added')
    }
  }
}else{
  //create new user
  let pushFavAlbum = { 
    id: req.params.id ,
    favAlbums: [],
    recentAlbums: [
      {
    album : req.body.album,
    albumImg : req.body.albumImg,
    albumArtist : req.body.albumArtist,
    albumLink : req.body.albumLink
      }
    ]
  }
  oldJson.push(pushFavAlbum);
  fs.writeFileSync("./data/users.json", JSON.stringify(oldJson), "utf-8")
  res.json('user added')
}

})
let port = process.env.PORT || 8888
console.log(`Listening on port ${port}. authencation server.`)
const result = dotenv.config()


console.log(result.parsed)
app.listen(port)