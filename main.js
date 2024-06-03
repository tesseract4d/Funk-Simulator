appendScript("./songs/list.js", () => {
    setInterval(mainLoop, 32);
    nextOption(Object.keys(list));
});
const _ = (a, b) => {
    let c = 0;
    while (a >= b) {
        a -= b;
        c++;
    };
    return c;
};
const getTime = () => {
    let a = audios[0].duration - audios[0].currentTime,
        c = 0;
    if (isNaN(a)) {
        return "0:00";
    }
    while (a >= 60) {
        a -= 60;
        c++;
    }
    a = String(Math.floor(a));
    if (a.length == 1) {
        a = "0" + a;
    }
    return c + ":" + a;
};
const getAccuracy = (a, b) => {
    if (!b) { return "0%"; }
    if (b * 350 == a) { return "100%"; }
    let s = String(a / b / 3.5);
    return s.substring(0, s.indexOf(".") + 3) + "%";
}


let choice = [];
let settings = { "botplay": false, "oppoent": false, "all": false }
function handleClick(event) {
    if (event.target.innerText == "<--") {
        if (choice.length == 0) {
            let a = [];
            for (let i in settings) {
                a.push(i + " : " + settings[i]);
            }
            nextOption(a);
            choice.push("_settings_");
        } else {
            nextOption(choice.length == 1 ? Object.keys(list) : list[choice[0]]);
            choice.pop();
        }
        return;
    } else {
        for (let i in settings) {
            if (event.target.innerText.startsWith(i)) {
                settings[i] = !settings[i];
                event.target.innerText = i + " : " + settings[i];
                return;
            }
        }
        choice.push(event.target.innerText);
    }
    if (choice.length == 3) {
        play(choice[0] + "/" + choice[1], choice[2]);
        choice = [];
        nextOption(Object.keys(list));
    } else {
        nextOption(choice.length == 1 ? list[event.target.innerText] : ["easy", "normal", "hard"]);
    }
}

function nextOption(x) {
    a = Array.from(x);
    a.push("<--");
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
    const b = document.createElement("ul");
    for (let j = 0; j < a.length; j++) {
        const c = document.createElement("li");
        c.innerText = a[j];
        c.addEventListener("click", handleClick);
        b.appendChild(c);
    }
    div.appendChild(b);
}

let canvas = document.getElementById("main");
let div = document.getElementById("div");
let ctx = canvas.getContext("2d");
let audios = [document.getElementById("inst"), document.getElementById("voices"), document.getElementById("sound")];
const center = a => (screenW - ctx.measureText(a).width) / 2;

let arrowsImg = new Image(),
    barsImg = new Image(),
    ratingImgs = [new Image(), new Image(), new Image(), new Image()],
    numImgs = [];
arrowsImg.src = "./imgs/arrows.png";
barsImg.src = "./imgs/arrowEnds.png";
ratingImgs[0].src = "./imgs/sick.png";
ratingImgs[1].src = "./imgs/good.png";
ratingImgs[2].src = "./imgs/bad.png";
ratingImgs[3].src = "./imgs/shit.png";
for (let i = 0; i < 10; i++) {
    numImgs[i] = new Image();
    numImgs[i].src = "./imgs/num" + i + ".png";
}

let playState = [[], [], [], [[], [], [], [], [], [], [], []], 0, 0, 1, 0, 0, "", false];
let noteState = [[-1, false], [-1, false], [-1, false], [-1, false], [-1, false], [-1, false], [-1, false], [-1, false]];
let touchState = [false, false, false, false];
let stats = [0, 0, 0, 0, 0];
const keyMapping = { s: 0, d: 1, k: 2, l: 3 };
let screenW, screenH, noteSize, barWidth, barHeight, barX, barY, startY, ratingHeight, ratingX, numWidth, numHeight, timeHeight, progressHeight, progressX, progressY, progressWidth, progressGap, statsHeight, statsY, itemHeight, h_w;
const devicePixelRatio = window.devicePixelRatio || 1;
function resize() {
    screenW = document.documentElement.clientWidth;
    screenH = document.documentElement.clientHeight;
    if (screenW > screenH * Math.SQRT1_2) {
        screenW = screenH * Math.SQRT1_2;
    }
    canvas.width = screenW;
    canvas.height = screenH;
    div.style.width = "100vw";
    div.style.height = "100vh";
    noteSize = _(screenW, 10);
    barWidth = noteSize / 17 * 7;
    barHeight = noteSize / 17 * 6;
    barX = (noteSize - barWidth) / 2;
    barY = (noteSize - barHeight) / 2;
    startY = screenH / 2 - noteSize;
    ratingHeight = (screenW - 8 * noteSize) / 51 * 20;
    ratingX = 4 * noteSize;
    numWidth = ratingHeight / 20 * 12;
    numHeight = ratingHeight / 20 * 16;
    timeHeight = _(screenH, 32);
    progressHeight = _(screenH, 64);
    progressX = screenW / 3;
    progressY = startY + timeHeight;
    progressWidth = screenW - 2 * progressX;
    progressGap = progressHeight / 3;
    statsHeight = _(screenW, 24);
    statsY = progressY + progressHeight + statsHeight;
    itemHeight = _(screenH, 24);
    let a = screenH / screenW;
    if (playState[0].length) {
        playState[4] *= a / h_w;
        playState[6] = playState[4] * barHeight / startY;
    }
    h_w = a;
}
window.addEventListener('resize', resize);
resize();

const getArrowX = a => a > 3 ? a * noteSize + (screenW - 8 * noteSize) : a * noteSize;
const drawArrow = (a, b, x, y) => ctx.drawImage(arrowsImg, a * 17, b * 17, 17, 17, x, y, noteSize, noteSize);
const drawBar = (a, b, x, y) => ctx.drawImage(barsImg, a * 7, b * 7, 7, 6, x + barX, y + barY, barWidth, barHeight);

canvas.addEventListener('touchstart', function (e) {
    e.preventDefault();
    for (let i of e.changedTouches) {
        ontouch(_(i.clientX * 4, screenW));
    }
}, false);

function back() {
    if (audios[0].paused) {
        audios[0].play();
        audios[1].play();
    } else {
        audios[0].pause();
        audios[1].pause();
    }
}

document.onkeydown = e => {
    let k = keyMapping[e.key];
    if (e.key == " ") {
        back();
    } else if (!touchState[k]) {
        ontouch(k);
    }
}

function ontouch(r) {
    playState[5] = audios[0].currentTime * 1000;
    if (!playState[5] || settings.botplay) { return; }
    touchState[r] = true;
    r += 4;
    for (var a = 0; a < playState[2].length; a++) {
        if (playState[2][a][1] === r) {
            let d = Math.abs(playState[2][a][0] - playState[5]);
            if (d >= 150) {
                break;
            }
            if (d <= 50) {
                stats[0] += 350;
                playState[8] = 0;
            } else if (d <= 100) {
                stats[0] += 200;
                playState[8] = 1;
            } else if (d <= 125) {
                stats[0] += 100;
                playState[8] = 2;
            } else {
                stats[0] += 50;
                playState[8] = 3;
            }
            stats[1]++;
            stats[3]++;
            noteState[r] = [playState[5] + 150, true];
            playState[7] = playState[5] + 1000;
            playState[2].splice(a, 1);
            return;
        }
    }
    noteState[r] = [playState[5] + 150, false];
}

function touchHandler(e) {
    e.preventDefault();
    if (settings.botplay) { return; }
    for (let i in touchState) {
        touchState[i] = false;
    }
    for (let i of e.targetTouches) {
        let r = _(i.clientX * 4, screenW);
        touchState[r] = true;
        noteState[r + 4] = [playState[5] + 50, false];
    }
}

document.onkeyup = e => touchState[keyMapping[e.key]] = false;

canvas.addEventListener('touchend', touchHandler, false);
canvas.addEventListener('touchmove', touchHandler, false);

function loadNotes(a, b) {
    playState[0] = a;
    playState[1] = [];
    playState[2] = [];
    playState[4] = 1500 / b * h_w / Math.SQRT2;
    playState[6] = playState[4] * barHeight / startY;
    playState[7] = 0;
    for (let i of noteState) {
        i[0] = -1;
    }
    for (let i of playState[3]) {
        i.splice(0, i.length);
    }
}

function appendScript(s, f) {
    let n = document.createElement("script");
    if (arguments.length > 0) {
        n.onload = f;
    }
    n.src = s;
    document.body.appendChild(n);
}

function play(a, b) {
    audios[0].src = "./songs/" + a + "/Inst.ogg";
    audios[1].src = "./songs/" + a + "/Voices.ogg";
    playAll();
    playState[9] = a + "@" + b;
    stats[0] = stats[1] = stats[2] = stats[3] = 0;
    appendScript("./songs/" + a + "/data-" + b + ".js");
}

async function playAll() {
    const promises = [loadAudio(audios[0]), loadAudio(audios[1])];
    await Promise.all(promises);

    audios[0].play();
    audios[1].play();
}

function loadAudio(audio) {
    return new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve);
        audio.addEventListener('error', reject);
        audio.load();
    });
}

ctx.fillStyle = "#FFF";

function mainLoop() {
    ctx.fillRect(0, 0, screenW, screenH);
    if (audios[0].paused) {
        if (canvas.style.display != "none") {
            canvas.style.display = "none";
        }
        if (div.style.display == "none") {
            div.style.display = "block";
        }
    } else {
        if (canvas.style.display == "none") {
            canvas.style.display = "block";
        }
        if (div.style.display != "none") {
            div.style.display = "none";
        }
        playState[5] = audios[0].currentTime * 1000;
        for (let i = 0; i < 8; i++) {
            let d = noteState[i][0] - playState[5], b = i > 3 && touchState[i - 4];
            if (d >= 0 || b) {
                drawArrow(i % 4, _(d, 75) ? 4 : (noteState[i][1] ? 3 : 2), getArrowX(i), noteSize / 17);
                if (b) {
                    noteState[i][0] = playState[5] + 50;
                }
            } else {
                drawArrow(i % 4, 0, getArrowX(i), 0);
            }
        }
        while (playState[0].length && playState[0][0][0] - playState[5] <= playState[4]) {
            if (playState[0][0][1] == 8) {
                playState[0][0][1] = 4 + Math.floor(Math.random() * 4);
            }
            if (settings.oppoent) {
                playState[0][0][1] += playState[0][0][1] > 3 ? -4 : 4;
            }
            if (settings.all && playState[0][0][1] < 4) {
                playState[0][0][1] += 4;
            }
            playState[playState[0][0][1] > 3 ? 2 : 1].push([playState[0][0][0], playState[0][0][1]]);
            if (playState[0][0][2]) {
                playState[3][Math.floor(playState[0][0][1])].push([playState[0][0][0], playState[0][0][0] + playState[0][0][2], true]);
            }
            playState[0].shift();
        }
        while (playState[1].length && playState[1][0][0] <= playState[5]) {
            noteState[playState[1][0][1]][0] = playState[5] + 150;
            noteState[playState[1][0][1]][1] = true;
            playState[1].shift();
        }
        if (settings.botplay) {
            while (playState[2].length && playState[2][0][0] <= playState[5]) {
                noteState[playState[2][0][1]][0] = playState[5] + 150;
                noteState[playState[2][0][1]][1] = true;
                playState[2].shift();
            }
        } else {
            while (playState[2].length && playState[2][0][0] + 150 <= playState[5]) {
                stats[0] -= 10;
                stats[1] = 0;
                stats[2]++;
                stats[3]++;
                playState[2].shift();
            }
        }
        ctx.globalAlpha = 0.5;
        for (let i in playState[3]) {
            for (let j in playState[3][i]) {
                if (playState[3][i][j][1] <= playState[5]) {
                    playState[3][i].splice(j, 1);
                }
            }
            for (let j in playState[3][i]) {
                let b = playState[3][i][j];
                if (i < 4 || settings.botplay) {
                    if (b[0] < playState[5]) {
                        b[0] = playState[5];
                        noteState[i][0] = playState[5] + 50;
                    }
                } else if (b[0] < playState[5] && noteState[i][0] - 50 >= playState[5]) {
                    b[0] = playState[5];
                } else if (b[0] <= playState[5] - 150) {
                    if (b[2]) {
                        stats[0] -= 10;
                        stats[1] = 0;
                        stats[2]++;
                        b[2] = false;
                    }
                    b[0] = playState[5] - 150;
                }
                for (let a = b[1]; a > b[0]; a -= playState[6]) {
                    let y = (a - playState[5]) / playState[4] * startY;
                    if (y > startY) { continue; }
                    if (!b[2]) ctx.globalAlpha = 0.3;
                    drawBar(i % 4, Number(a == b[1]), getArrowX(i), y);
                    if (!b[2]) ctx.globalAlpha = 0.6;
                }
            }
        }
        let a = (playState[7] - playState[5]) / 1000;
        if (a > 0) {
            ctx.globalAlpha = a;
            let m = ratingImgs[playState[8]];
            ctx.drawImage(m, ratingX, 0, ratingHeight / m.height * m.width, ratingHeight);
            let s = String(stats[1]);
            while (s.length < 3) {
                s = "0" + s;
            }
            for (let b = 0; b < s.length; b++) {
                ctx.drawImage(numImgs[s.charAt(b)], ratingX + numWidth * b, ratingHeight, numWidth, numHeight);
            }
        }
        ctx.globalAlpha = 1;
        for (let n of playState[1].concat(playState[2])) {
            drawArrow(n[1] % 4, 1, getArrowX(n[1]), (n[0] - playState[5]) / playState[4] * startY);
        }

        ctx.fillRect(0, startY, screenW, noteSize);
        ctx.fillStyle = "#000";
        ctx.fillRect(progressX, progressY, progressWidth, progressHeight);
        let t = getTime(),
            s = stats[0] + " / " + getAccuracy(stats[0], stats[3]) + " [" + stats[2] + "]";
        ctx.font = timeHeight + "px 宋体";
        ctx.fillText(t, center(t), progressY);
        ctx.font = statsHeight + "px 宋体";
        ctx.fillText(s, center(s), statsY);
        ctx.fillStyle = "#FFF";
        ctx.fillRect(progressX + progressGap, progressY + progressGap, (progressWidth - progressGap * 2) * (audios[0].currentTime / audios[0].duration), progressGap);
    }
}