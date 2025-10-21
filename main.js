const input = document.getElementById('input');
const color_picker = document.getElementById('color');
const vol_slider = document.getElementById('vol-slider');
const type_sound = document.getElementById('type-selector')
const audioCtx = new AudioContext();
const gainNode = audioCtx.createGain();
console.log("1")

// canvas stuff
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var width = ctx.canvas.width;
var height = ctx.canvas.height;
var freq = 0;
var amplitude = 40;
var interval = null;
var x = 0;
var y = height/2;
var reset = true;
var timpernote = 0;
var length = 0;

var counter = 0;
function drawWave() {
    clearInterval(interval);
    if (reset) {
        ctx.clearRect(0, 0, width, height);
        x = 0;
        y = height/2;
        reset = false;  // Set reset to false after first clear
    }
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    counter = 0;
    interval = setInterval(() => {
        if (x < width) {  
            line();
            counter++;
        } else {
            clearInterval(interval);
            reset = true;  // Set reset to true when done
        }
    }, 20);
}

function line() {
    let phase = (x * freq * 0.05) % (Math.PI * 2);
    let waveValue;

    switch(type_sound.value) {
        case 'sine':
            waveValue = Math.sin(phase);
            break;
        case 'triangle':
            waveValue = (2 / Math.PI) * Math.asin(Math.sin(phase));
            break;
        case 'square':
            waveValue = Math.sin(phase) >= 0 ? 1 : -1;
            break;
        case 'sawtooth':
            waveValue = 2 * ((phase / (Math.PI * 2)) - Math.floor((phase / (Math.PI * 2)) + 0.5));
            break;
    }

    y = height/2 + amplitude * waveValue;
    ctx.strokeStyle = color_picker.value;
    ctx.lineTo(x, y);
    ctx.stroke();
    x = x + 1;
}

const oscillator = audioCtx.createOscillator();
oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);
oscillator.type = type_sound.value;

oscillator.start();
gainNode.gain.value = 0;
console.log("okay uh")

type_sound.addEventListener('change', () => {
    oscillator.type = type_sound.value;
    console.log("Oscillator type changed to:", type_sound.value);
});

notenames = new Map();
notenames.set("C", 261.6);
notenames.set("E", 329.6);
notenames.set("F", 349.2);
notenames.set("G", 392.0);
notenames.set("A", 440);
notenames.set("B", 493.9);

function frequency(pitch) {
    gainNode.gain.setValueAtTime(vol_slider.value / 100, audioCtx.currentTime);
    oscillator.frequency.setValueAtTime(pitch, audioCtx.currentTime);
    setTimeout(() => { gainNode.gain.value = 0; }, timpernote - 10);
    freq = pitch / 100;  // Changed from 1000 to 100 for better oscillation
    drawWave();
}

function handle() {
    audioCtx.resume();
    gainNode.gain.value = 0;
    var usernotes = String(input.value);
    var noteslist = [];
    length = usernotes.length;
    timpernote = (3000 / length);
    console.log("Playing notes:", input.value);
    console.log("Time per note:", timpernote);
    
    for (let i = 0; i < usernotes.length; i++) {
        let note = notenames.get(usernotes.charAt(i).toUpperCase());
        if (note) {
            noteslist.push(note);
        }
    }
    
    console.log("Notes to play:", noteslist);
    
    let j = 0;
    let repeat = setInterval(() => {
        if (j < noteslist.length) {
            console.log("Playing note", j, ":", noteslist[j]);
            frequency(noteslist[j]);
            j++;
        } else {
            clearInterval(repeat);
        }
    }, timpernote);
}