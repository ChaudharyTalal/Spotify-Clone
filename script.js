let currentSong = new Audio();
let songs = [];
let play = document.querySelector("#play");
let songName = document.querySelector(".songName");
let SongTime = document.querySelector(".duration");
let currFolder;

function secondToMinutesSeconds(second) {
    if (isNaN(second) || second < 0) {
        return "00:00";
    }

    const minutes = Math.floor(second / 60);
    const remainingSecond = Math.floor(second % 60);

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSecond).padStart(2, "0");
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    
    try {
        // Load from static JSON instead of fetching directory
        const response = await fetch('./songs-data.json');
        const data = await response.json();
        
        // Extract folder name from path (e.g., "songs/mysongs/" -> "mysongs")
        const folderName = folder.split('/').filter(Boolean).pop();
        const album = data.albums.find(a => a.folder === folderName);
        
        if (!album) {
            console.error('Album not found:', folderName);
            return;
        }
        
        songs = album.songs;
        
        // Show all songs in playlist
        let songsUl = document.querySelector(".songsList").getElementsByTagName("ul")[0];
        songsUl.innerHTML = "";
        
        for (const song of songs) {
            songsUl.innerHTML += `
                <li>
                    <img class="invert" src="./img/music.svg" alt="">
                    <div class="info">
                        <div>${song.replaceAll("%20", " ")}</div>
                    </div>
                    <div class="playnow">
                        <div>Play now</div>
                        <img class="invert" src="./img/play.svg" alt="">
                    </div>
                </li>`;
        }

        // Attach event listeners
        Array.from(document.querySelector(".songsList").getElementsByTagName("li")).forEach((e) => {
            e.addEventListener("click", () => {
                const trackName = e.querySelector(".info").firstElementChild.innerHTML;
                playMusic(trackName);
                songName.innerHTML = trackName;
                play.src = "./img/pause.svg";
            });
        });

        // Event for next song
        let next = document.querySelector("#next");
        next.addEventListener("click", () => {
            console.log("Next clicked");
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
            if ((index + 1) < songs.length) {
                currentSong.pause();
                let nextSong = songs[index + 1];
                playMusic(nextSong);
                songName.innerHTML = nextSong.replaceAll("%20", " ").replaceAll(".mp3", "");
                play.src = "./img/pause.svg";
            }
        });

        // Event for previous song
        let previous = document.querySelector("#previous");
        previous.addEventListener("click", () => {
            console.log("Previous clicked");
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
            if ((index - 1) >= 0) {
                currentSong.pause(); // Fixed: Add pause call
                let previousSong = songs[index - 1]; // Fixed: Better variable naming
                playMusic(previousSong);
                songName.innerHTML = previousSong.replaceAll("%20", " ").replaceAll(".mp3", "");
                play.src = "./img/pause.svg";
            }
        });
        
    } catch (error) {
        console.error("Error loading songs:", error);
    }
}

const playMusic = (track) => {
    // Play first song
    currentSong.src = `/${currFolder}` + track;
    currentSong.play();
};

async function displayAlbums() {
    try {
        const response = await fetch('./songs-data.json');
        const data = await response.json();
        
        const cardContainer = document.querySelector(".card-container");
        cardContainer.innerHTML = "";
        
        for (const album of data.albums) {
            const cardHTML = `
                <div data-folder="${album.folder}" class="card">
                    <div class="play"><i class="fa-solid fa-play"></i></div>
                    <img src="./songs/${album.folder}/cover.jpg" alt="${album.title}">
                    <h2>${album.title}</h2>
                    <p>${album.description || "Hits to boost your mood and fill you with happiness"}</p>
                </div>`;
            cardContainer.innerHTML += cardHTML;
        }
        
        // Attach event listeners
        document.querySelectorAll(".card").forEach(card => {
            card.addEventListener("click", async () => {
                const folder = card.dataset.folder;
                console.log("Album clicked:", folder);
                await getSongs(`songs/${folder}/`);
            });
        });
        
    } catch (error) {
        console.error("Error loading albums:", error);
    }
}

async function main() {
    // Display all albums first
    await displayAlbums();
    
    // Load first album by default (mySongs)
    await getSongs(`songs/mySongs/`);

    // Attach event listener to pause/play 
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "./img/pause.svg";
        } else if (!currentSong.paused) { // Fixed: Correct condition
            play.src = "./img/play.svg";
            currentSong.pause();
        }
    });

    // Listen for time update event
    currentSong.addEventListener("timeupdate", () => {

        SongTime.innerHTML = `${secondToMinutesSeconds(
            currentSong.currentTime
        )}/ ${secondToMinutesSeconds(currentSong.duration)} `;

        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Listen to change the seek bar
    document.querySelector(".seek-bar").addEventListener("click", (e) => {
        let percent = e.offsetX / e.target.getBoundingClientRect().width;

        let circle = document.querySelector(".circle");
        circle.style.left = percent * 100 + "%";
        circle.style.transition = "0.1s";
        currentSong.currentTime = currentSong.duration * percent;
    });

    // Listener for hamburger
    let hamburger = document.querySelector(".hamburger");
    hamburger.addEventListener("click", () => {
        document.querySelector(".left").style.left = "0px";
        document.querySelectorAll(".songsList ul li img, .songsList ul li .playnow").forEach((element) => {
            element.style.display = "flex";
        });
    });

    // Event for cross
    let cross = document.querySelector(".cross");
    cross.addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Event for controlling the volume
    let vol = document.querySelector(".range").getElementsByTagName("input")[0];
    vol.addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;

        if (e.target.value <= 100 && e.target.value >= 70) {
            document.querySelector(".vol").innerHTML = `<i class="fa-regular fa-volume-high"></i>`;
        } else if (e.target.value < 70 && e.target.value >= 30) {
            document.querySelector(".vol").innerHTML = `<i class="fa-regular fa-volume"></i>`;
        } else if (e.target.value >= 1 && e.target.value < 30) {
            document.querySelector(".vol").innerHTML = `<i class="fa-regular fa-volume-low"></i>`;
        } else if (e.target.value == 0) {
            document.querySelector(".vol").innerHTML = `<i class="fa-regular fa-volume-xmark"></i>`;
        }
    });
}

main();