'use strict';

document.addEventListener('DOMContentLoaded', startCalculator);

var numInput = 0;

function startCalculator() {
    document.getElementById("button0").addEventListener("click", numButtonClicked);
    Array.from(document.getElementsByClassName("numButtons")).forEach(button => button.addEventListener("click", numButtonClicked));
    document.getElementById("buttonDel").addEventListener("click", delButtonClicked);
}

function numButtonClicked(evt) {
    console.log(evt.target.innerText);
    let numStr = getString(numInput);

    if (isTooLong(numStr)) return;

    numStr += evt.target.innerText;
    numInput = parseFloat(numStr);
    document.getElementById("resultText").innerHTML = numInput;
    console.log(numInput);
}

function delButtonClicked(evt) {
    console.log(evt.target.innerText);
    let numStr = getString(numInput).slice(0, -1);
    if (numStr.length == 0) {
        numInput = 0;
    } else {
        numInput = parseFloat(numStr);
    }
    document.getElementById("resultText").innerHTML = numInput;
}

function getString(num) {
    return "" + num;
}

function isTooLong(str) {
    let tmpStr = str.replace(".", "");
    if (tmpStr.length == 16) {
        document.getElementById("dingSound").play();
        return true;
    }
    return false;
}