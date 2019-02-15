'use strict';

document.addEventListener('DOMContentLoaded', startCalculator);

var bufferEntry = [];
var entryStr = "0";
var hasDecimal = false;
var isOperatorMode = false;
var isDivByZeroLockup = false;
var isInvalidNumLockup = false;
var isRecipMode = false;
var isSqrtMode = false;
var isPercentMode = false;
var isMemoryMode = false;
var doneEqual = false;
var dingSound;
var lastOprStr = "";
var memStorage = 0;
var calcMode = 0;

function startCalculator() {
    document.getElementById("button0").addEventListener("click", numButtonClicked);

    Array.from(document.getElementsByClassName("numButtons")).forEach(button => button.addEventListener("click", numButtonClicked));
    Array.from(document.getElementsByClassName("oprButtons")).forEach(button => button.addEventListener("click", oprButtonClicked));
    Array.from(document.getElementsByClassName("memButtons")).forEach(button => button.addEventListener("click", memButtonClicked));
    document.getElementById("buttonDel").addEventListener("click", delButtonClicked);
    document.getElementById("buttonDot").addEventListener("click", dotButtonClicked);
    document.getElementById("buttonCE").addEventListener("click", clearEntryClicked);
    document.getElementById("buttonAC").addEventListener("click", allClearClicked);
    document.getElementById("buttonEql").addEventListener("click", equalButtonClicked);
    document.getElementById("buttonRECIP").addEventListener("click", recipButtonClicked);
    document.getElementById("buttonPer").addEventListener("click", buttonPercentClicked);
    document.getElementById("buttonNeg").addEventListener("click", buttonNegateClicked);
    document.getElementById("buttonSqrt").addEventListener("click", sqrtButtonClicked);

    // initialize sound element
    dingSound = document.getElementById("dingSound");

    // add listener to detect change of Calculator mode
    document.getElementById("calculatorMode").onchange = updateCalculationMode;

    forceBrowserZoom();
}

function forceBrowserZoom() { // force zooming at 100%
    document.body.style.zoom = 1.0
    
    var scale = 'scale(1.0)';
    document.body.style.webkitTransform =  scale;    // Chrome, Opera, Safari
    document.body.style.msTransform =   scale;       // IE 9
    document.body.style.transform = scale;     // General
}

function updateCalculationMode() {
    resetEverything();
    calcMode = document.getElementById("calculatorMode").value;

    if (calcMode == 0) {
        document.getElementById("modeExplanation").innerHTML = "Calculate from left to right, ignoring operator precedence";
        document.getElementById("modeExample").innerHTML = "eg. 2 + 3 x 5 + 1 = 26";
    } else {
        document.getElementById("modeExplanation").innerHTML = "Following operator precedence to do calculation";
        document.getElementById("modeExample").innerHTML = "eg. 2 + 3 x 5 + 1 = 18";
    }

}

function numButtonClicked(evt) {
    if (isDivByZeroLockup || isInvalidNumLockup ||
        (!isOperatorMode && !doneEqual && !isRecipMode && !isSqrtMode && isTooLong(entryStr))) {
        playDingSound();
        return;
    }

    if (entryStr === "0" || isOperatorMode || doneEqual ||
        isRecipMode || isSqrtMode || isPercentMode ||
        isMemoryMode) {

        entryStr = getString(evt.target.innerText);

        if (!isOperatorMode && (isRecipMode || isSqrtMode)) {
            bufferEntry.pop();
            displayBufferEntry();
        }
        isOperatorMode = false;
        doneEqual = false;
        isRecipMode = false;
        isSqrtMode = false;
        isPercentMode = false;
        isMemoryMode = false;
    } else {
        entryStr += evt.target.innerText;
    }
    displayResultEntry(entryStr);
}


function oprButtonClicked(evt) {
    let opr = evt.target.value;

    if (isDivByZeroLockup || isInvalidNumLockup) {
        playDingSound();
        return;
    }

    if (isOperatorMode) {
        bufferEntry.pop();
        bufferEntry.push(opr);
    } else if (isRecipMode || isSqrtMode) {
        bufferEntry.push(opr);
        entryStr = calculate();
        displayResultEntry(entryStr);
    } else {
        bufferEntry.push(entryStr);
        bufferEntry.push(opr);
        entryStr = calculate();
        displayResultEntry(entryStr);
    }

    displayBufferEntry();
    isOperatorMode = true;
    hasDecimal = false;
}

function memButtonClicked(evt) {
    let buttonName = evt.target.value
    switch (buttonName) {
        case "MC":
            memoryClear();
            break;
        case "MR":
            memoryRecall();
            break;
        case "MS":
            memorySet();
            break;
        case "M+":
            memoryPlus();
            break;
        case "M-":
            memorySub();
            break;
    }
    isMemoryMode = true;
}

function memoryClear() {
    memStorage = 0;
    hideMemoryIndicator();
}

function memoryRecall() {
    entryStr = getString(prettyRound(memStorage));
    displayResultEntry(entryStr);

    if (!isOperatorMode && (isRecipMode || isSqrtMode)) {
        bufferEntry.pop();
        displayBufferEntry();
    }
    isRecipMode = false;
    isSqrtMode = false;
}

function memorySet() {
    memStorage = getNumber(entryStr);
    showMemoryIndicator();
}

function memoryPlus() {
    memStorage += prettyRound(getNumber(entryStr));
    if (memStorage == 0) {
        hideMemoryIndicator();
    } else {
        showMemoryIndicator();
    }
}

function memorySub() {
    memStorage -= prettyRound(getNumber(entryStr));
    if (memStorage == 0) {
        hideMemoryIndicator();
    } else {
        showMemoryIndicator();
    }
}

function delButtonClicked(evt) {

    if (isDivByZeroLockup || isInvalidNumLockup ||
        isOperatorMode || doneEqual || isRecipMode ||
        isSqrtMode || isPercentMode) {
        playDingSound();
        return;
    }

    if (entryStr[entryStr.length - 1] === ".") {
        hasDecimal = false;
    }

    let numStr = entryStr.slice(0, -1);
    if (numStr.length == 0) {
        resetEntry();
    } else {
        entryStr = numStr;
    }
    displayResultEntry(entryStr);
}

function dotButtonClicked(evt) {
    if (isDivByZeroLockup || isInvalidNumLockup) {
        playDingSound();
        return;
    }

    if (doneEqual) {
        entryStr = "0";
        doneEqual = false;
    } else if (hasDecimal) {
        playDingSound();
        return;
    }
    hasDecimal = true;
    entryStr += ".";
    displayResultEntry(entryStr);
}


function recipButtonClicked(evt) {
    if (isDivByZeroLockup || isInvalidNumLockup) {
        playDingSound();
        return;
    }

    let formatStr = "recip(" + entryStr + ")";
    bufferEntry.push(formatStr);

    if (entryStr === "0") {
        setDivideByZeroLockup();
        playDingSound();
    } else {
        isRecipMode = true;
        entryStr = getString(prettyRound(1 / getNumber(entryStr)));
    }

    displayResultEntry(entryStr);
    displayBufferEntry();

}

function sqrtButtonClicked(evt) {
    if (isDivByZeroLockup || isInvalidNumLockup) {
        playDingSound();
        return;
    }

    let formatStr = "sqrt(" + entryStr + ")";
    bufferEntry.push(formatStr);

    if (getNumber(entryStr) < 0) {
        setInvalidNumLockup();
        playDingSound();
    } else {
        isSqrtMode = true;
        entryStr = getString(prettyRound(sqrt(entryStr)));
    }

    displayResultEntry(entryStr);
    displayBufferEntry();
}

function equalButtonClicked(evt) {
    if (isDivByZeroLockup || isInvalidNumLockup) {
        playDingSound();
        return;
    }

    if (bufferEntry.length == 0 && lastOprStr.length > 0) {
        entryStr = repeatLastOperation();
    } else {
        bufferEntry.push(entryStr);
        entryStr = calculate();
    }
    displayResultEntry(entryStr);
    clearBufferEntry();
    isOperatorMode = false;
    isRecipMode = false;
    isSqrtMode = false;
    hasDecimal = false;
    isPercentMode = false;
    doneEqual = true;
}

function buttonPercentClicked(evt) {
    if (isDivByZeroLockup || isInvalidNumLockup) {
        playDingSound();
        return;
    }

    if (bufferEntry.length < 2) {
        entryStr = getString(prettyRound(getNumber(entryStr) / 100));
    } else {
        let referValue = bufferEntry[bufferEntry.length - 2];
        entryStr = getString(prettyRound(getNumber(referValue) * getNumber(entryStr) / 100));
    }
    isPercentMode = true;
    displayResultEntry(entryStr);
}

function buttonNegateClicked(evt) {
    if (isDivByZeroLockup || isInvalidNumLockup) {
        playDingSound();
        return;
    }

    let num = getNumber(entryStr);
    entryStr = getString(-num);
    displayResultEntry(entryStr);
}

function calculate() {

    if (bufferEntry.length < 3) {
        return entryStr;
    }

    var total = 0;

    if (calcMode == 0) { // standard calculation
        total = standardCalculation(bufferEntry);
    } else {
        total = scientificCalculation(bufferEntry);
    }

    total = prettyRound(total);
    console.log("total = ", total);
    return getString(total);
}


function standardCalculation(arrEntry) {
    var total = getNumber(arrEntry[0]);
    for (var i = 1; i < arrEntry.length - 1; i += 2) {
        let operator = arrEntry[i];
        let operand = getNumber(arrEntry[i + 1]);
        switch (operator) {
            case "+":
                total += operand;
                lastOprStr = " + " + operand;
                break;
            case "-":
                total -= operand;
                lastOprStr = " - " + operand;
                break;
            case "*":
                total *= operand;
                lastOprStr = " * " + operand;
                break;
            case "/":
                if (operand == 0) {
                    setDivideByZeroLockup();
                    return;
                }
                //console.log("total: ", total, " operand: ", operand);
                total /= operand;
                lastOprStr = " / " + operand;
                //console.log("new total: ", total);
                break;
        }
    }
    //console.log("standard total: ", total);
    return total;
}


function scientificCalculation(arrEntry) {

    let arrLength = arrEntry.length;
    let lastItem = arrEntry[arrLength - 1];

    if ((lastItem == "*") || (lastItem == "/")) {
        return entryStr;
    }

    if ((lastItem == "+") || (lastItem == "-")) {
        arrEntry = arrEntry.slice(0, arrLength - 1);
    }

    let operationStr = arrEntry.join(' ');
    console.log(operationStr);
    let total = eval(operationStr);
    return total;
}


function repeatLastOperation() {
    let total = eval(entryStr + lastOprStr);
    return prettyRound(total);
}

function displayBufferEntry() {
    let tmpStr = "";

    bufferEntry.forEach(item => {
        tmpStr += item + " ";
    });

    let length = tmpStr.length;
    if (length > 40) {
        tmpStr = "&#8810;" + tmpStr.substring(length - 39, length - 1);
    }
    document.getElementById("progressText").innerHTML = tmpStr;
}

function displayResultEntry(numStr) {

    if (isDivByZeroLockup) {
        numStr = "cannot divide by zero";
    } else if (isInvalidNumLockup) {
        numStr = "invalid number";
    }

    let el = document.getElementById("resultText");
    if (numStr.length > 17) {
        el.style.fontSize = "1.2rem";
    } else {
        el.style.fontSize = "1.4rem";
    }
    el.innerHTML = numStr;
}

function showMemoryIndicator() {
    document.getElementById("memIndicator").innerHTML = "M";
}

function hideMemoryIndicator() {
    document.getElementById("memIndicator").innerHTML = "";
}

function clearBufferEntry() {
    bufferEntry = [];
    document.getElementById("progressText").innerHTML = "";
}

function resetEntry() {
    entryStr = "0";
    hasDecimal = false;
    doneEqual = false;
    isPercentMode = false;
    isDivByZeroLockup = false;
    isInvalidNumLockup = false;
    displayResultEntry(entryStr);
}

function resetEverything() {
    resetEntry();
    clearBufferEntry();
    isOperatorMode = false;
    isRecipMode = false;
    isSqrtMode = false;
    lastOprStr = "";
}

function clearEntryClicked(evt) {
    if (isDivByZeroLockup || isInvalidNumLockup) {
        resetEverything();
    } else {
        resetEntry();
    }
}

function allClearClicked(evt) {
    resetEverything();
}

function setDivideByZeroLockup() {
    isDivByZeroLockup = true;
}

function setInvalidNumLockup() {
    isInvalidNumLockup = true;
}

function playDingSound() {
    //console.log(new Error().stack);
    dingSound.currentTime = 0; // stop old playing sound
    dingSound.play();
}

function getString(num) {
    return "" + num;
}

function getNumber(str) {

    if (!isNaN(str)) {
        return Number(str);
    }

    let regex1 = /^recip/i;
    let regex2 = /^sqrt/i;

    if (regex1.test(str) || regex2.test(str)) {
        let num = eval(str);
        return num;
    }

    return NaN;

}

function isTooLong(str) {

    // Force to become a string before continue
    str = getString(str);

    let tmpStr = str.replace(".", "");
    if (tmpStr.length == 16) {
        return true;
    }
    return false;
}

function prettyRound(num) {
    return Math.round(num * 1000000000000000) / 1000000000000000;
}

function recip(num) {
    return 1 / num;
}

function sqrt(num) {
    return Math.sqrt(num);
}