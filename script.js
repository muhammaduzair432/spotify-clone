let playingSong = null;
let songs;
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

// funciton to get the songs from the folder
async function getSongs(folder) {
  let a = await fetch(
    `http://localhost:5500/${folder ? "playlists/" + folder + "/" : "songs/"}`
  );
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;

  let as = div.getElementsByTagName("a");
  // console.log(as);
  let songs = [];

  for (let index = 0; index < as.length; index++) {
    const element = as[index];

    // console.log(decodeURI(element.href));

    if (element.href.endsWith(".mp3.preview")) {
      let song = element.href.split("/");

      song = song[song.length - 1].split(".")[0] + ".mp3";
      songs.push(decodeURI(song));
    } else if (element.href.endsWith(".preview")) {
      let song = decodeURIComponent(
        element.href.split("/")[element.href.split("/").length - 2]
      );
      songs.push(song);
    }
  }

  let newSongs = [];
  songs.forEach((element) => {
    if (element.endsWith(".mp3")) {
      newSongs.push(element);
    }
  });

  return newSongs;
}

// function to play the music
let playMusic = (track, pause = false) => {
  if (playingSong) {
    playingSong.pause();
    playpause.src = "pause.png";
  }
  playpause.src = "play-button-arrowhead.png";

  playingSong = new Audio("http://localhost:5500/songs/" + track);

  playingSong.play();

  let songsinfo = (document.querySelector(".songsinfo").innerHTML = track);

  let songstime = (document.querySelector(".songstime").innerHTML = "0:0/0:0");

  playingSong.addEventListener("timeupdate", () => {
    document.querySelector(".songstime").innerHTML = `${secondsToMinutesSeconds(
      playingSong.currentTime
    )} / ${secondsToMinutesSeconds(playingSong.duration)}`;
    document.querySelector(".circle").style.left =
      (playingSong.currentTime / playingSong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    playingSong.currentTime = (playingSong.duration * percent) / 100;
  });
};

// function to get the playslists from the server
async function getplaylists() {
  // Fetch the playlists from the server
  let stuff = await fetch("http://localhost:5500/playlists");
  // convert the response to text
  let response = await stuff.text();
  // Create a div to parse the HTML response
  let div = document.createElement("div");
  // Set the innerHTML of the div to the response
  div.innerHTML = response;
  // Get all the anchor tags from the div
  let as = div.getElementsByTagName("a");

  // create an array to store the playlists
  let playlists = [];

  // loopt through the anchor tags and get the href attribute
  Array.from(as).forEach((element) => {
    // if the innerText is not empty, decode the href and push the playlist name to the array
    if (element.innerText !== "") {
      let newElement = decodeURI(element.href.replaceAll("//", "/"));

      playlists.push(newElement.split("/")[newElement.split("/").length - 2]);
    }
  });

  // remove the first two and last element from the array
  playlists = playlists.slice(3, playlists.length - 1);

  return playlists;
}

let displayPlaylists = (playlists) => {
  let playlistContainer = document.querySelector(".cardcontainer");

  playlists.forEach((playlist) => {
    playlistContainer.innerHTML += `
       <div class="cards">
              <img
                src="./playlists/${playlist}/spotify image.jpg"
                alt=""
                height="220px"
                width="250px"
              />
              <h2>${playlist}</h2>
              <p>by Uzair</p>
            </div>
    `;
  });
};

// function to display the songs in the songs library
let displaySongs = (songs) => {
  let songUl = document
    .querySelector(".songsname")
    .getElementsByTagName("ul")[0];

  songUl.innerHTML = ""; // Clear the existing list

  for (const song of songs) {
    songUl.innerHTML += `<li> 
            <span>${song}</span>
            <div class="info">  
            <img src="2play.png" alt="" height="20px" width="20px" />
            </div> 
        </li>`;
  }

  Array.from(
    document.querySelector(".songsname").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector("span").innerHTML);
      if (playingSong.paused) {
        playpause.src = "play-button-arrowhead.png";
      } else {
        playpause.src = "pause.png";
      }
    });
  });
};

async function main() {
  let playlists = await getplaylists();

  displayPlaylists(playlists);

  let songs = await getSongs();

  displaySongs(songs);

  // adding the onclick event listerner to all playlists
  Array.from(document.querySelectorAll(".cards")).forEach((element) => {
    element.addEventListener("click", async () => {
      let playlistName = element.querySelector("h2").innerText;
      let songs = await getSongs(playlistName);
      displaySongs(songs);
      if (playMusic(songs[0], true)) {
        playpause.src = "pause.png";
      }
    });
  });

  let playpause = document.querySelector("#playpause");

  playpause.addEventListener("click", () => {
    if (playingSong.paused) {
      playingSong.play();
      playpause.src = "pause.png";
    } else {
      playingSong.pause();
      playpause.src = "play-button-arrowhead.png";
    }
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0px";
  });

  document.querySelector("#close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  //  event  listener for next button
  document.querySelector("#next").addEventListener("click", () => {
    if (!playingSong) {
      playMusic(songs[0]);
    } else {
      let currentIndex = songs.indexOf(
        decodeURI(
          playingSong.src.split("/")[playingSong.src.split("/").length - 1]
        )
      );
      if (currentIndex + 1 < songs.length) playMusic(songs[currentIndex + 1]);
    }
    // event listener for previous button
  });

  document.querySelector("#previous").addEventListener("click", () => {
    if (!playingSong) {
      playMusic(songs[117]);
    } else {
      let currentIndex = songs.indexOf(
        decodeURI(
          playingSong.src.split("/")[playingSong.src.split("/").length - 1]
        )
      );

      if (currentIndex - 1 >= 0) playMusic(songs[currentIndex - 1]);
    }
  });
}

main();
