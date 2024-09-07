console.log(emojiData["😀"]);


// fill in flag options
document.addEventListener("DOMContentLoaded", function (event) {
    // add flags to list
    for (flag in flagcolors) {
        let flagform = document.getElementById("flagform");
        flagform.innerHTML += "<div class=\"inputitem flagradio\"><input type=\"radio\" value=\"" + flag + "\" id=\"" + flag + "\" name=\"flaginput\" onclick=\"flagUpdate()\"> <label for=\"" + flag + "\" class=\"flagselect\"><span class=\"flagtext\">" + flag + "</span><br><img class=\"flagimage\" src=\"" + flagcolors[flag]["image"] + "\"></label></div>";
    }
    // add categories to list
    let categoryform = document.getElementById("categoryform");
    for (category in categorylist) {
        let append = "<span class=\"inputitem\"> <input type=\"checkbox\" checked id=\"" + categorylist[category]["name"] + "\" value=\"" + categorylist[category]["name"] + "\" name=\"category\"> <label for=\"" + categorylist[category]["name"] + "\">" + categorylist[category]["text"] + "</label></span>";
        categoryform.innerHTML += append;
    }
});

function selectAllNone() {
    let button = document.getElementById("categoryselect");
    if (button.innerText == "Deselect All") {
        let checkboxes = document.getElementsByName("category");
        for (checkbox of checkboxes) {
            checkbox.checked = false;
        }
        button.innerText = "Select All";
    }
    else {
        let checkboxes = document.getElementsByName("category");
        for (checkbox of checkboxes) {
            checkbox.checked = true;
        }
        button.innerText = "Deselect All";
    }
    event.preventDefault();
}

function copyEmoji() {
    button = document.getElementById("copy");
    button.innerText = "COPY";
    let dropdowns = document.getElementsByName("emojiselect");
    let emojis = "";
    for (dropdown of dropdowns) {
        emojis += dropdown.value;
    }
    textarea = document.getElementById("textarea");
    textarea.value = emojis;
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(textarea.value);
    button.innerText = "COPIED";
}

function rgb2hsy(rgb) {
    let R = rgb[0];
    let G = rgb[1];
    let B = rgb[2];
    let M = Math.max(R, G, B);
    let m = Math.min(R, G, B);
    let C = M - m;
    let H = 0;
    if (C == 0) {
        H = 0;
    }
    else if (M == R) {
        H = (G - B) / C;
        H = H % 6;
    }
    else if (M == G) {
        H = (B - R) / C + 2;
    }
    else if (M == B) {
        H = (R - G) / C + 4;
    }
    H *= 60;
    let Y = 0.2989 * R + 0.5870 * G + 0.1140 * B;
    Y = Y / 255;
    let L = 0.5 * (M + m) / 255;
    let S = 0;
    if (L == 0 || L == 1) {
        S = 0;
    }
    else {
        S = C / (1 - Math.abs(2 * L - 1)) / 255;
    }
    return ([H, S, Y]);
}
function hsy2rect(hsy) {
    let x = hsy[2] * Math.cos(hsy[0] * Math.PI / 180) * 150;
    let y = hsy[2] * Math.sin(hsy[0] * Math.PI / 180) * 150;
    let z = hsy[1] * 100;
    return ([x, y, z]);
}

// use distance formula to find distance between colors in rgb cube
function colorDistance(color1, color2) {
    let distance = Math.sqrt(Math.pow((color1[0] - color2[0]), 2) + Math.pow((color1[1] - color2[1]), 2) + Math.pow((color1[2] - color2[2]), 2));
    return distance;
}
function sort2d(array, column) {
    return (array.sort(
        function sortFunction(a, b) {
            if (a[column] === b[column]) {
                return 0;
            }
            else {
                return (a[column] < b[column]) ? -1 : 1;
            }
        }))
}

function checkInclusion(emoji, categories) {
    let emojiCategories = emoji["categories"];
    for (category of emojiCategories) {
        if (categories.includes(category)) {
            return true;
        }
    }
    return false;
}

function getCustomFlag() {
    let colors = document.getElementsByClassName("colorpicker");
	flagcolors["custom"]["colors"] = [];
    for (color of colors) {
        console.log(color.value);
        let rgb = [];
        rgb.push(parseInt(color.value.slice(1,3),16));
        rgb.push(parseInt(color.value.slice(3,5),16));
        rgb.push(parseInt(color.value.slice(5,7),16));
        flagcolors["custom"]["colors"].push(rgb);
    }
    console.log(flagcolors["custom"]["colors"])
}

function findClosest(flagColor, os, categories) {
    let closest = []; // distances of emoji to color
    for (emoji in emojiData) {
        if (checkInclusion(emojiData[emoji], categories)) {
            if (emojiData[emoji][os]["url"] != "") {
                let primary = colorDistance(hsy2rect(rgb2hsy(flagColor)), hsy2rect(rgb2hsy(emojiData[emoji][os]["colors"]["primary"])));
                let primarysecondaryratio = emojiData[emoji][os]["colors"]["primary"][3] / emojiData[emoji][os]["colors"]["secondary"][3];
                if (primarysecondaryratio >= 1.5 || primarysecondaryratio < 0) {
                    closest.push([emoji, primary, emojiData[emoji][os]["colors"]["primary"][3]]);
                }
            }
        }
    }
    sort2d(closest, 2); // sorts by amount of primary color
    closest.reverse();
    sort2d(closest, 1); // sorts by color distance
    return closest.slice(0, 9);
}

function getCategories() {
    let checkboxes = document.getElementsByName("category");
    let checked = [];
    for (checkbox in checkboxes) {
        if (checkboxes[checkbox].checked) {
            checked.push(checkboxes[checkbox].value);
        }
    }
    return checked;
}
function getOS() {
    let radiobuttons = document.getElementsByName("os");
    for (button of radiobuttons) {
        if (button.checked) {
            return button.value;
        }
    }
    return false;
}
function getFlag() {
    let flags = document.getElementsByName("flaginput");
    for (flag of flags) {
        if (flag.checked) {
            return flag.value;
        }
    }
    return false;
}

function onSubmit() {
    button = document.getElementById("copy");
    button.innerText = "COPY";
    let os = getOS();
    let categories = getCategories();
    let flag = getFlag()
    if (flag=="custom") {
        getCustomFlag();
    }
    if (os == false) {
        alert("must select vendor");
    }
    if (categories.length == 0) {
        alert("must select at least one category");
    }
    if (flag == false) {
        alert("must select flag");
    }
    if (categories.length > 0 && flag && os) {
        let tablewidth = 0
        let result = document.getElementById("result");
        let colorrow = document.getElementById("colorrow");
        let imagerow = document.getElementById("imagerow");
        let emojirow = document.getElementById("emojirow");
        colorrow.innerHTML = "";
        imagerow.innerHTML = "";
        emojirow.innerHTML = "";
        result.style = "display:block;";
        for (color in flagcolors[flag].colors) {
            colorrow.innerHTML += "<td style=\"background-color: rgb(" + flagcolors[flag].colors[color][0] + "," + flagcolors[flag].colors[color][1] + "," + flagcolors[flag].colors[color][2] + ");\"></td>";
            imagerow.innerHTML += "<td><img class=\"emojiimg\" src=\"" + "\"></td>"
            emojirow.innerHTML += "<td><select name=\"emojiselect\" id=\"emoji" + color + "\"></select></td>";
            tablewidth += 80;
            result.style.width = tablewidth + "px";
        }
        let dropdowns = document.getElementsByName("emojiselect")
        let images = document.getElementsByClassName("emojiimg");
        let dropdownindex = 0
        for (let color of flagcolors[flag].colors) {
            let closestEmoji = findClosest(color, os, categories);
            for (let emoji of closestEmoji) {
                dropdowns[dropdownindex].innerHTML += "<option value=\"" + emoji[0] + "\">" + emoji[0] + "</option>";

            }
            images[dropdownindex].src = emojiData[closestEmoji[0][0]][os]["url"];
            dropdownindex += 1;
        }
        document.getElementById("copy").style.display = "block";

        /* "<option value=\"" + emoji[0] + "\"><img src=\"" + emojiData[emoji[0]][os]["url"] + "\"></option>"*/

    }
    document.addEventListener('input', function (event) {

        // Only run on our select menu
        if (event.target.name !== 'emojiselect') return;

        let dropdowns = document.getElementsByName("emojiselect");
        let images = document.getElementsByClassName("emojiimg");
        for (let i = 0; i < dropdowns.length; i++) {
            let emoji = dropdowns[i].value;
            images[i].src = emojiData[emoji][os].url;
        }

    }, false);
}

function chooseStripes() {
    let stripechooser = document.getElementById("stripeinput")
    stripechooser.style = "display:none;";
    let stripes = document.getElementById("stripeinputbox").value;
    console.log(stripes);
    let colorpickers = document.getElementById("colorpickers");
    colorpickers.innerHTML = "<button onclick=\"back()\" class=\"backnext\">←</button>"
    for (let i=0; i<stripes; i++) {
        colorpickers.innerHTML += "<input type=\"color\" class=\"colorpicker\">";
    }
    colorpickers.style = "display:block;"
    event.preventDefault();
}

function back() {
    let colorpickers = document.getElementById("colorpickers");
    colorpickers.style = "display:none;"
    let stripechooser = document.getElementById("stripeinput")
    stripechooser.style = "display:block;";
}

function flagUpdate() {
    let form = document.getElementById("customflagform");
    if (getFlag()=="custom") {
        form.style="display:block";
    }
    else {
        form.style="display:none";
    }
}