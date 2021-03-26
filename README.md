# Lyric Sheet

Lyric Sheet is a React-App thatis clean visualization tool to enhance an album listening experience.

## Installation
Clone the repo.

Move to the file location and use the package manager [npm] in both the server and client folder to install the correct dependencies
```bash
npm install
```

in the .env file in the server folder add you on spotify api keys
to get them
https://developer.spotify.com/dashboard/login

```bash
SPOTIFY_CLIENT_ID = "ENTER CLIENT ID HERE"
SPOTIFY_CLIENT_SECRET = "ENTER SECRET HERE"
```

in the client folder go to src/components/Playback.jsx and in line 182 add your own genuis keys
to get them
https://genius.com/api-clients

```bash
 sendTracks(){
        let newArray = [];
        let options = {
            apiKey: 'ENTER YOUR GENUIS API KEY HERE',
            title: "",
            artist: this.state.trackArtist,
            optimizeQuery: true
        };  
```



## Usage

```python
import foobar

foobar.pluralize('word') # returns 'words'
foobar.pluralize('goose') # returns 'geese'
foobar.singularize('phenomena') # returns 'phenomenon'
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
