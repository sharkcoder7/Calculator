'use strict';

document.addEventListener('DOMContentLoaded', startCalculator);

var numInput = 0;

function startCalculator() {
    document.getElementById("button0").addEventListener("click", numButtonClicked);
    Array.from(document.getElementsByClassName("numButtons")).forEach(button => button.addEventListener("click", numButtonClicked));
}

function numButtonClicked(evt) {
    console.log(evt.target.innerText);
    let numStr = "" + numInput;
    numStr += evt.target.innerText;
    numInput = parseFloat(numStr);
    document.getElementById("resultText").innerHTML = numInput;
    console.log(numInput);
}