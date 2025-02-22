// // Define color transitions using rgba()
// const fullCycle = [
//     { color: "rgba(44, 14, 14, 0.2)", duration: 2 },  // Morning start
//     { color: "rgba(44, 14, 14, 0.1)", duration: 2 },
//     { color: "rgba(44, 14, 14, 0.3)", duration: 2 },
//     { color: "rgba(44, 14, 14, 0.4)", duration: 2 },  // Sundown transition
//     { color: "rgba(80, 40, 30, 0.45)", duration: 2 },  // Slight warm sunset
//     { color: "rgba(80, 40, 30, 0.50)", duration: 2 },  // Slight warm sunset (stronger)
//     { color: "rgba(70, 30, 20, 0.55)", duration: 2 },  // Slightly warmer evening transition
//     { color: "rgba(0, 0, 0, 0.56)", duration: 2 },  // Evening transition
//     { color: "rgba(0, 11, 98, 0.55)", duration: 2 },
//     { color: "rgba(0, 11, 98, 0.61)", duration: 2 },  // Night transition
//     { color: "rgba(0, 11, 98, 0.55)", duration: 2 },
//     { color: "rgba(0, 11, 98, 0.50)", duration: 2 },  // Reverse Night
//     { color: "rgba(0, 0, 0, 0.56)", duration: 2 },
//     { color: "rgba(0, 0, 0, 0.48)", duration: 2 },
//     { color: "rgba(0, 0, 0, 0.41)", duration: 2 },  // Reverse Evening
//     { color: "rgba(44, 14, 14, 0.4)", duration: 2 },
//     { color: "rgba(44, 14, 14, 0.3)", duration: 2 },
//     { color: "rgba(44, 14, 14, 0.2)", duration: 2 },  // Reverse Sundown
//     { color: "rgba(44, 14, 14, 0.1)", duration: 2 },  // Gradual morning transition
// ];

// // 🌟 Create a GSAP timeline
// const tl = gsap.timeline({ repeat: -1, ease: "linear" });

// // Loop through colors and add them to the timeline
// fullCycle.forEach(step => {
//     tl.to("#DayNightCycle", { backgroundColor: step.color, duration: step.duration });
// });


const fullCycle = [
    { color: "rgba(44, 14, 14, 0.2)", duration: 90 },  // Morning start
    { color: "rgba(44, 14, 14, 0.1)", duration: 90 },
    { color: "rgba(44, 14, 14, 0.1)", duration: 90 },
    { color: "rgba(44, 14, 14, 0.4)", duration: 90 },  // Sundown transition
    { color: "rgba(80, 40, 30, 0.45)", duration: 90 },  // Slight warm sunset
    { color: "rgba(80, 40, 30, 0.50)", duration: 90 },  // Slight warm sunset (stronger)
    { color: "rgba(70, 30, 20, 0.55)", duration: 90 },  // Slightly warmer evening transition
    { color: "rgba(0, 0, 0, 0.56)", duration: 90 },  // Evening transition
    { color: "rgba(0, 11, 98, 0.55)", duration: 90 },
    { color: "rgba(0, 11, 98, 0.61)", duration: 90 },  // Night transition
    { color: "rgba(0, 11, 98, 0.55)", duration: 90 },
];


//Create a GSAP timeline
const tl = gsap.timeline({ repeat: -1, ease: "linear" });

fullCycle.forEach(step => {
    tl.to("#DayNightCycle", { backgroundColor: step.color, duration: step.duration });
});

const timeElement = document.querySelector("#clock");

// Virtual time in seconds (8:00 AM)
export let virtualSeconds = { value: 8 * 3600 }
export let formattedHours;
export let formattedMinutes;
export let interval;

let lastUpdate = performance.now(); // High-precision timestamp


function updateClock() {
    let now = performance.now();
    let elapsedRealSeconds = (now - lastUpdate) / 1000;
    lastUpdate = now;

    virtualSeconds.value += elapsedRealSeconds * 48; // Real seconds to virtual time (30 minutes / 20 transitions)

    // Convert virtual time into hours and minutes (24-hour format)
    let hours24 = Math.floor((virtualSeconds.value / 3600) % 24);
    let minutes = Math.floor((virtualSeconds.value % 3600) / 60);

    interval = hours24 >= 12 ? "PM" : "AM";
    let hours12 = (hours24 % 12) || 12; // Convert to 12-hour format

    formattedHours = hours12.toString().padStart(2, "0");
    formattedMinutes = minutes.toString().padStart(2, "0");

    timeElement.innerHTML = formattedHours + ":" + formattedMinutes + " " + interval;

    // Sync GSAP Animation with Time of Day
    if (hours24 >= 7 && hours24 < 8) { 
        tl.seek(0);  
    } else if (hours24 >= 8 && hours24 < 9) {
        tl.seek(90);  
    } else if (hours24 >= 9 && hours24 < 12) {
        tl.seek(180); 
    } else if (hours24 >= 12 && hours24 < 15) {
        tl.seek(270); 
    } else if (hours24 >= 15 && hours24 < 16) {
        tl.seek(90);
    } else if (hours24 >= 16 && hours24 < 17) {
        tl.seek(360);  
    } else if (hours24 >= 17 && hours24 < 18) {
        tl.seek(630);  
    } else if (hours24 >= 18 && hours24 < 19) {
        tl.seek(720);  
    } else if (hours24 >= 19 && hours24 < 20) {
        tl.seek(810);  
    } else if (hours24 >= 20 && hours24 < 24) {
        tl.seek(900);  
    } else if (hours24 >= 0 && hours24 < 4) {
        tl.seek(900); 
    } else if (hours24 >= 4 && hours24 < 5) {
        tl.seek(990);
    } else {
        tl.seek(1710); 
    }    
    
    requestAnimationFrame(updateClock);
}

//Start the Clock
updateClock();
