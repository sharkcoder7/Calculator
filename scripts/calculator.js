'use strict';

document.addEventListener('DOMContentLoaded', startCalculator);

var bufferEntry = [];
var entryStr = "0";
var hasDecimal = false;
var isOperatorMode = false;
var isDivByZeroLockup = false;
var isRecipMode = false;
var doneEqual = false;
var dingSound;
var lastOprStr = "";

function startCalculator() {
    document.getElementById("button0").addEventListener("click", numButtonClicked);

    Array.from(document.getElementsByClassName("numButtons")).forEach(button => button.addEventListener("click", numButtonClicked));
    document.getElementById("buttonDel").addEventListener("click", delButtonClicked);
    document.getElementById("buttonDot").addEventListener("click", dotButtonClicked);
    document.getElementById("buttonCE").addEventListener("click", clearEntryClicked);
    document.getElementById("buttonAC").addEventListener("click", allClearClicked);
    document.getElementById("buttonAdd").addEventListener("click", addButtonClicked);
    document.getElementById("buttonSub").addEventListener("click", subButtonClicked);
    document.getElementById("buttonEql").addEventListener("click", equalButtonClicked);
    document.getElementById("buttonMul").addEventListener("click", mulButtonClicked);
    document.getElementById("buttonDiv").addEventListener("click", divButtonClicked);
    document.getElementById("buttonRECIP").addEventListener("click", recipButtonClicked);

    // initialize sound element
    dingSound = document.getElementById("dingSound");

}

function numButtonClicked(evt) {
    if (isDivByZeroLockup ||
       (!doneEqual && !isRecipMode && isTooLong(entryStr))) {
        playDingSound();
        return;
    }

    if (entryStr === "0" || isOperatorMode) {
        entryStr = getString(evt.target.innerText);
    } else if (isRecipMode) {
        entryStr = getString(evt.target.innerText);
        bufferEntry.pop();
        isRecipMode = false;
        displayBufferEntry();
    } else if (doneEqual) {
        entryStr = evt.target.innerText;
        doneEqual = false;
    } else {
        entryStr += evt.target.innerText;
    }

    document.getElementById("resultText").innerHTML = entryStr;
    isOperatorMode = false;
}

function delButtonClicked(evt) {

    if (isDivByZeroLockup ||
        isOperatorMode ||
        doneEqual) {
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
    document.getElementById("resultText").innerHTML = entryStr;
}

function dotButtonClicked(evt) {
    if (isDivByZeroLockup) {
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
    document.getElementById("resultText").innerHTML = entryStr;
}

function addButtonClicked(evt) {
    doOperation("+");
}

function subButtonClicked(evt) {
    doOperation("-");
}

function mulButtonClicked(evt) {
    doOperation("*");
}

function divButtonClicked(evt) {
    doOperation("/");
}

function doOperation(opr) {
    if (isDivByZeroLockup) {
        playDingSound();
        return;
    }

    if (isOperatorMode) {
        bufferEntry.pop();
        bufferEntry.push(opr);
    } else if (isRecipMode) {
        bufferEntry.push(opr);
        entryStr = calculate();
        document.getElementById("resultText").innerHTML = getString(entryStr);
    } else {
        bufferEntry.push(entryStr);
        bufferEntry.push(opr);
        entryStr = calculate();
        document.getElementById("resultText").innerHTML = getString(entryStr);
    }

    displayBufferEntry();
    isOperatorMode = true;
    hasDecimal = false;
}

function recipButtonClicked(evt) {
    if (isDivByZeroLockup) {
        playDingSound();
        return;
    }

    if (entryStr === "0") {
        setDivideByZeroLockup();
        playDingSound();
        return;
    }

    let recipStr = "recip(" + entryStr + ")";
    bufferEntry.push(recipStr);
    entryStr = 1 / getNumber(entryStr);
    entryStr = prettyRound(entryStr);
    isRecipMode = true;
    document.getElementById("resultText").innerHTML = getString(entryStr);
    displayBufferEntry();

}

function equalButtonClicked(evt) {
    if (isDivByZeroLockup) {
        playDingSound();
        return;
    }

    if (bufferEntry.length == 0 && lastOprStr.length > 0) {
        entryStr = repeatLastOperation();
        document.getElementById("resultText").innerHTML = getString(entryStr);
    } else {
        bufferEntry.push(entryStr);
        entryStr = calculate();
        document.getElementById("resultText").innerHTML = getString(entryStr);
    }
    clearBufferEntry();
    isOperatorMode = false;
    isRecipMode = false;
    hasDecimal = false;
    doneEqual = true;
}

function calculate() {

    if (bufferEntry.length < 3) {
        return entryStr;
    }

    var total = getNumber(bufferEntry[0]);
    for (var i = 1; i < bufferEntry.length - 1; i += 2) {
        let operator = bufferEntry[i];
        let operand = getNumber(bufferEntry[i + 1]);
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
                console.log("total: ", total, " operand: ", operand);
                total /= operand;
                lastOprStr = " / " + operand;
                console.log("new total: ", total);
                break;
        }
    }
    total = prettyRound(total);
    return getString(total);
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

function clearBufferEntry() {
    bufferEntry = [];
    document.getElementById("progressText").innerHTML = "";
}

function resetEntry() {
    entryStr = "0";
    hasDecimal = false;
    doneEqual = false;
    document.getElementById("resultText").innerHTML = entryStr;
}

function resetEverything() {
    resetEntry();
    clearBufferEntry();
    isOperatorMode = false;
    isRecipMode = false;
    isDivByZeroLockup = false;
    lastOprStr = "";
}

function clearEntryClicked(evt) {
    if (isDivByZeroLockup) {
        resetEverything();
    } else {
        resetEntry();
    }
}

function allClearClicked(evt) {
    resetEverything();
}

function setDivideByZeroLockup() {
    document.getElementById("resultText").innerHTML = "cannot divide by zero";
    isDivByZeroLockup = true;
}

function playDingSound() {
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

    let regex = /^recip/i;
    if (regex.test(str)) {
        let num = eval(str);
        console.log("recip: ", num);
        return num;
    }

    return NaN;

}

function isTooLong(str) {

    // Force to become a string before continue
    if (typeof str !== String) {
        str = getString(str);
    }

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