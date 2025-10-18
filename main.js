const input = document.getElementById('input');
const audioCtx = new AudioContext();
const gainNode = audioCtx.createGain();
console.log("1")

// canvas stuff
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var width = ctx.canvas.width;
var height = ctx.canvas.height;
freq = pitch / 10000;
var amplitude = 40;
var interval = null;

var counter = 0;
function drawWave() {
    ctx.clearRect(0, 0, width, height);
    x = 0
    y = height/2;
    ctx.moveTo(x,y);
    ctx.beingPath();
    counter = 0;
    counter++;
    interval = setInterval(line, 20);
    if(counter > 50) {
        clearInterval(interval);
    }
}

function line() {
    y = height/2 + (amplitude * Math.sin(x * 2 * Math.PI * freq));
    ctx.lineTo(x, y);
    ctx.stroke();
    x = x + 1;
}

const oscillator = audioCtx.createOscillator();
oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);
oscillator.type = "sine";

oscillator.start();
gainNode.gain.value = 0;
console.log("okay uh")

notenames = new Map();
notenames.set("C", 261.6);
notenames.set("E", 329.6);
notenames.set("F", 349.2);
notenames.set("G", 392.0);
notenames.set("A", 440);
notenames.set("B", 493.9);

function frequency(pitch) {
    gainNode.gain.setValueAtTime(100, audioCtx.currentTime);
    oscillator.frequency.setValueAtTime(pitch, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime + 1);
};


function handle() {
    audioCtx.resume();
    gainNode.gain.value = 0;
    notenames.get(Map);
    var usernotes = String(input.value);
    console.log(input.value);
    frequency(notenames.get(usernotes));
}