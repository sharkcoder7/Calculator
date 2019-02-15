'use strict';

document.addEventListener('DOMContentLoaded', startCalculator);

var numInputStr = "0";
var hasDecimal = false;
var dingSound;

function startCalculator() {
    document.getElementById("button0").addEventListener("click", numButtonClicked);
    Array.from(document.getElementsByClassName("numButtons")).forEach(button => button.addEventListener("click", numButtonClicked));
    document.getElementById("buttonDel").addEventListener("click", delButtonClicked);
    document.getElementById("buttonDot").addEventListener("click", dotButtonClicked);
    
    // initialize sound element
    dingSound = document.getElementById("dingSound");
}

function numButtonClicked(evt) {
    console.log(evt.target.innerText);

    if (isTooLong(numInputStr)) {
        playDingSound();
        return;
    } 

    if (numInputStr === "0") {
        numInputStr = getString(evt.target.innerText);
    } else {
        numInputStr += evt.target.innerText;
    }

    document.getElementById("resultText").innerHTML = numInputStr;
    console.log(numInputStr);
}

function delButtonClicked(evt) {
    console.log(evt.target.innerText);

    if (numInputStr[numInputStr.length-1] === ".") {
        hasDecimal = false;
    }

    let numStr = numInputStr.slice(0, -1);
    if (numStr.length == 0) {
        numInputStr = "0";
    } else {
        numInputStr = numStr;
    }
    document.getElementById("resultText").innerHTML = numInputStr;
}

function dotButtonClicked(evt) {
    console.log("dot clicked");
    if (hasDecimal) {
        playDingSound();
        return;
    }
    hasDecimal = true;
    numInputStr += ".";
    document.getElementById("resultText").innerHTML = numInputStr;
}

function playDingSound() {
    dingSound.currentTime = 0;  // stop old playing sound
    dingSound.play();
}

function getString(num) {
    return "" + num;
}

function isTooLong(str) {
    let tmpStr = str.replace(".", "");
    if (tmpStr.length == 16) {
        return true;
    }
    return false;
}