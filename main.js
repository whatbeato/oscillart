const input = document.getElementById('input');
const color_picker = document.getElementById('color');
const vol_slider = document.getElementById('vol-slider');
const type_sound = document.getElementById('type-selector');
const recording_toggle = document.getElementById('record');;
const audioCtx = new AudioContext();
const gainNode = audioCtx.createGain();
console.log("1")

// var this, var that...
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

var blob, recorder = null;
var chunks = [];

function startRecording(){
   const canvasStream = canvas.captureStream(20);
   const combinedStream = new MediaStream();
   const audioDestination = audioCtx.createMediaStreamDestination();
   gainNode.connect(audioDestination);
   canvasStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
   audioDestination.stream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
   recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });
   recorder.ondataavailable = e => {
    if (e.data.size > 0) {
        chunks.push(e.data);
        }
    };

    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recording.webm';
        a.click();
        URL.revokeObjectURL(url);
        chunks = []; 
    };
    
    recorder.start(); 
}

var is_recording = false;
function toggle() {
   is_recording = !is_recording; 
   if(is_recording){
       recording_toggle.innerHTML = "Stop Recording";
       startRecording(); 
   } else {
       recording_toggle.innerHTML = "Start Recording";
       recorder.stop();
   }
}

var counter = 0;
function drawWave() {
    clearInterval(interval);
    // Only reset x if we've reached the end of the canvas
    if (x >= width) {
        ctx.clearRect(0, 0, width, height);
        x = 0;
        y = height/2;
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
    // If we're in the middle, just continue from current position
    
    counter = 0;
    interval = setInterval(() => {
        if (x < width) {  
            line();
            counter++;
        } else {
            clearInterval(interval);
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

vol_slider.addEventListener('input', () => {
    amplitude = (vol_slider.value / 100) * 40; // Scale amplitude based on slider (0-40)
    console.log("Amplitude changed to:", amplitude);
    // Redraw the current wave with new amplitude
    if (freq > 0) {
        drawWave();
    }
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