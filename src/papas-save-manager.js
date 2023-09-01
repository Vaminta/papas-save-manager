// ==UserScript==
// @name        Papa's Save Manager
// @namespace   vaminta
// @match       https://www.coolmathgames.com/0-papas-bakeria
// @match       https://www.coolmathgames.com/0-papas-freezeria
// @grant       none
// @version     0.2.0
// @author      Vaminta
// @run-at      document-idle
// @description Allows you to backup your Papa's Bakeria save data on coolmathgames.com
// @homepageURL https://github.com/Vaminta/papas-bakeria-save-manager
// ==/UserScript==

//31/07/2023, 17:49:11
//01/09/2023

psm = new Object();

/*
USER OPTIONS:

saveTxtExt: (bool) export outputs the file with .txt extension rather than .psm - same contents
forceImport: (bool) bypass validation checks (not recommended)
preventGameLoad: (bool) attempts to prevent game loading, useful for internal testing

 */
psm.userOptions = {
    saveTxtExt: false,
    forceImport: false,
    preventGameLoad: false
}

// --------------

psm.version = "0.2.0";
psm.saveVersion = "001";
psm.savePrefix = "PSMS"; //PSM save
psm.saveExt = "psm";
psm.gameList = Object.freeze([
    {
        name:"Papa's Bakeria",
        pathname: "/0-papas-bakeria",
        saveName: "papasbakeria_save",
        saveIdentifier: "08",
        lsKeys: ["//papasbakeria1","//papasbakeria2","//papasbakeria3"]
    },
    {
        name:"Papa's Freezeria",
        pathname: "/0-papas-freezeria",
        saveName: "papasfreezeria_save",
        saveIdentifier: "09",
        lsKeys: ["//papasfreezeria_1","//papasfreezeria_2","//papasfreezeria_3"]
    }
]);

psm.game = null;

const pbsmCSS = `
.pbsm-imp-button, .pbsm-exp-button{
    background-color: #1d3752;
    color: #ffffff;
    border: 1px #06203b solid;
    border-radius: 5px;
    width: 70px;
    height: 30px;
}

.pbsm-imp-button:hover, .pbsm-exp-button:hover{
    background-color: #2d4762;
}
`;

function injectCSS(css){
    let styleE = document.createElement("style");
    styleE.innerText = css;
    document.head.appendChild(styleE);
}

function slotHasSave(slot){
    let result = false;
    const data = localStorage.getItem(psm.game.lsKeys[slot]);
    if(data!=null&&data.length>20) result = true;
    return result;
}

//Generic download function
function download(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function exportSave(slot){
    if(!slotHasSave(slot)){
        alert("No save in slot " + (slot+1) + " detected!");
        return;
    }
    const data = psm.savePrefix + psm.saveVersion + psm.game.saveIdentifier + localStorage.getItem(psm.game.lsKeys[slot]);
    const filename = psm.game.saveName + "." + psm.saveExt;
    download(filename,data);
}

//Checks content of PSM for validity and returning results as object containing breakdown, useful for providing user feedback
function isValidSave(data,expGameID){
    if(!data)data = "";
    if(!expGameID) expGameID = psm.game.saveIdentifier;
    let result = {
        isNotEmpty: data.length>0 ? true : false,
        isPSMS: data.slice(0,4)==psm.savePrefix ? true : false,
        isNotTimeTraveller: parseInt(data.slice(4,7)) <= parseInt(psm.saveVersion) ? true : false, //save isn't from future version of psm
        isCorrectGame: (expGameID=="*" || data.slice(7,9) == psm.game.saveIdentifier) ? true : false,
        isEncoded: true, //implement later
        conclusion: false
    };
    result.conclusion = (result.isNotEmpty && result.isPSMS && result.isNotTimeTraveller && result.isCorrectGame && result.isEncoded) ? true : false;
    return result;
}

function processImport(slot,data){
    //const expectedSaveID = gsm.game.saveIdentifier;
    //const saveVersion = parseInt(psm.saveVersion);
    const fileValidity = isValidSave(data);
    const key = psm.game.lsKeys[slot];
    const forceLoad = psm.userOptions.forceImport;
    console.log(fileValidity);
    if(fileValidity.conclusion || forceLoad){ //continue to load
        const importData = data.slice(9);
        localStorage.setItem(key,importData);
    }
    else{ // do not load -> show error
        let errorMsg = "PSM Import Error: \n\n";
        if(!fileValidity.isNotEmpty) errorMsg += " - File is empty\n";
        else if(!fileValidity.isPSMS) errorMsg += " - File is unrecognised format\n";
        else{
            if(!fileValidity.isNotTimeTraveller) errorMsg += " - File was exported from a future version of PSM, please update\n";
            if(!fileValidity.isCorrectGame) errorMsg += " - File appears to be for a different Papa's series game\n";
        }
        errorMsg += "\nFurther information and help may be found on GitHub";
        alert(errorMsg);
    }
}

// Setup file reader then send output to processImport
function importSave(slot){
    if(slotHasSave(slot)){
        let overwrite = confirm("There is already data in slot " + (slot+1) + ". Are you sure you want to overwrite?");
        if(!overwrite) return;
    }
    const file = document.getElementById("file-picker").files[0];
    const reader = new FileReader();
    reader.addEventListener("load",function(){
        processImport(slot,reader.result);
    },false,);
    if(file) reader.readAsText(file);
}

/*
Handles button clicks from the import and export buttons
*/
function handleButtonClick(e,func){
    let targetSave = e.parentElement.getAttribute("data-ss")-1;
    if(func=="import"){
        document.getElementById("file-picker").onchange = function(){importSave(targetSave)};
        document.getElementById("file-picker").click();
    }
    else if(func=="export"){
        exportSave(targetSave);
    }
}

function genTableHTML(){
    const impButtHTML = '<button class="pbsm-imp-button">Import</button>';
    const expButtHTML = '<button class="pbsm-exp-button">Export</button>';
    let table = "<table>";
    table += "<tr><th>Slot 1</th><th>Slot 2</th><th>Slot 3</th></tr>";
    table += "<tr><td data-ss='1' >" + impButtHTML + "</td><td data-ss='2' >"+ impButtHTML + "</td><td data-ss='3' >"+impButtHTML+"</td></tr>"; //data-saveslot
    table += "<tr><td data-ss='1'>" + expButtHTML + "</td><td data-ss='2' >"+ expButtHTML + "</td><td data-ss='3' >"+expButtHTML+"</td></tr>";
    table += "</table>";
    return table;
}

function addOnclicks(){
    let importButtons = document.getElementsByClassName("pbsm-imp-button");
    let exportButtons = document.getElementsByClassName("pbsm-exp-button");
    for(let i=0;i<importButtons.length;i++){
        importButtons[i].onclick = function(){handleButtonClick(this,"import")};
    }
    for(let i=0;i<exportButtons.length;i++){
        exportButtons[i].onclick = function(){handleButtonClick(this,"export")};
    }
}

function generateHTML(){
    let div = document.createElement("div");
    div.id = "pbsm-cont"; //papas save manager container
    div.className = "game-meta-body";
    div.style = "padding-bottom: 1%;";
    let genHTML = "<h2>Save Manager</h2><p>This save manager allows you to import and export saves to ensure they are never lost. Saves can also be moved between devices.</p>";
    genHTML += genTableHTML();
    div.innerHTML = genHTML;

    let filePicker = document.createElement("input");
    filePicker.setAttribute("type","file");
    filePicker.id = "file-picker";
    filePicker.style.display = "none";
    div.appendChild(filePicker);

    let footerP = document.createElement("p");
    footerP.style = "font-size:10px; margin: 2% 0% 0% 0%;";
    footerP.innerHTML = "Version: " + psm.version + " ・ Running game: " + psm.game.name + " ・ Software provided without warranty ・ More info on <a href='https://github.com/Vaminta/papas-bakeria-save-manager' target='_blank' >GitHub</a>"
    div.appendChild(footerP);

    let parentNode = document.getElementsByClassName("game-meta-body")[0];
    document.getElementsByClassName("node__content clearfix field-item")[0].insertBefore(div,parentNode);
    addOnclicks();
}

// returns singular game object by given key + matching value
function getGame(key,value){
    let game = null;
    for(let i=0;i<psm.gameList.length;i++){
        if(psm.gameList[i][key]==value){
            game = psm.gameList[i];
            break;
        }
    }
    return game;
}

function detectGame(){
    psm.game = getGame("pathname", window.location.pathname);
    console.log(psm.game);
}

//attempt to prevent the game from loading
function blockGame(){
    let wrapper = document.getElementById("swfgamewrapper");
    wrapper.innerHTML = "";
}

function initialise(){
    detectGame();
    if(psm.userOptions.saveTxtExt) psm.saveExt = "txt";
    if(psm.userOptions.preventGameLoad) blockGame();
    injectCSS(pbsmCSS);
    generateHTML();
}

initialise();
