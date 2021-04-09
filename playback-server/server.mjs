import { getLyrics, getSong } from 'genius-lyrics-api';
import express from 'express';
import bodyParser from "body-parser";
import multer from "multer";
import cors from 'cors';
const forms = multer();
const app = express();

app.use(cors())
app.use(bodyParser.json());
app.use(forms.array());
app.use(bodyParser.urlencoded({ extended: true }));
 
app.post('/playback', function(req, res){
	let newArray = [];
	let options = {
	apiKey: 'Nd9cZuvDxu-q2mvaGXVxV7LKZFrrNGkuufZwGEFM9QNDzHNwTZOZUUKAd6fI9aps',
	title: req.body.album[0],
	artist: req.body.artist,
	optimizeQuery: true
};

for(let i = 0; i< req.body.album.length; i++){
	options.title = req.body.album[i]
	getLyrics(options).then((lyrics) => {
		let track ={
			trackTitle: req.body.album[i],
			trackNumber: i + 1,
			lyrics: lyrics,                    
		}
		newArray.push((track));
	});
}; 

setTimeout(() => res.json(newArray), 1500)
	
})

let port = process.env.PORT || 8080
console.log(`Listening on port ${port}. playback server.`)

app.listen(port)
