const express = require('express')
const request = require('request')
const querystring = require('querystring')
const dotenv = require('dotenv')
const { default: axios } = require('axios')
const getLyrics = 'genius-lyrics-api';


const app = express()

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

let port = process.env.PORT || 8888
console.log(`Listening on port ${port}. Go /login to initiate authentication flow.`)
const result = dotenv.config()


console.log(result.parsed)
app.listen(port)