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
in the server folder run

```bash
node server.js
```
in the client folder run

```bash
npm start
```
Go to localhost:3000 with a broswer with disable same orgin policy off.

For Windows:  

1.Open the start menu

2.Type windows+R or open "Run"

3.Execute the following command:  
    ```
     chrome.exe --user-data-dir="C://Chrome dev session" --disable-web-security
    ```
    
For Mac:  

 1.Go to Terminal
 
 2.Execute the following command:  
    ```
     open /Applications/Google\ Chrome.app --args --user-data-dir="/var/tmp/Chrome dev session" --disable-web-security
    ```

If options above dont work check out:  
https://stackoverflow.com/questions/3102819/disable-same-origin-policy-in-chrome?page=1&tab=votes#tab-top

## License
[MIT](https://choosealicense.com/licenses/mit/)

