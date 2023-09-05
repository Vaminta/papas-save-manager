// ==UserScript==
// @name        Papa's Save Manager
// @namespace   vaminta
// @match       https://www.coolmathgames.com/0-papas-bakeria
// @match       https://www.coolmathgames.com/0-papas-freezeria
// @match       https://www.coolmathgames.com/0-papas-burgeria
// @match       https://www.coolmathgames.com/0-papas-taco-mia
// @match       https://www.coolmathgames.com/0-papas-pancakeria
// @match       https://www.coolmathgames.com/0-papas-cupcakeria
// @match       https://www.coolmathgames.com/0-papas-cheeseria
//
// @match       https://www.crazygames.com/game/papa-s-burgeria
// @match       https://games.crazygames.com/en_US/papa-s-burgeria/index.html
// @grant       none
// @version     0.4.0
// @author      Vaminta
// @run-at      document-idle
// @description Allows you to backup your save data for the Papa's series of games on coolmathgames.com
// @homepageURL https://github.com/Vaminta/papas-save-manager
// ==/UserScript==

//04/09/2023

psm = new Object();

/*
USER OPTIONS:

saveTxtExt: (bool) export outputs the file with .txt extension rather than .psm - same contents
forceImport: (bool) bypass validation checks (not recommended)
otherPageAdjustments: (bool) allows script to change other parts of webpage to fix potential problems
preventGameLoad: (bool) attempts to prevent game loading, useful for internal testing

 */
psm.userOptions = {
    saveTxtExt: false,
    forceImport: false,
    otherPageAdjustments: false,
    preventGameLoad: false
}

// --------------

psm.version = "0.4.0";
psm.saveVersion = "001";
psm.savePrefix = "PSMS"; //PSM save
psm.saveExt = "psm";
psm.gameList = Object.freeze([
    {
        name:"Papa's Bakeria",
        pathname: "/0-papas-bakeria",
        saveName: "papasbakeria_save",
        saveIdentifier: "08",
        lsKeys: ["//papasbakeria1","//papasbakeria2","//papasbakeria3"],
        hosts:[
            {
                hostname: "www.coolmathgames.com",
                pathname: "/0-papas-bakeria",
                iframe: ""
            }
        ]
    },
    {
        name:"Papa's Freezeria",
        pathname: "/0-papas-freezeria",
        saveName: "papasfreezeria_save",
        saveIdentifier: "09",
        lsKeys: ["//papasfreezeria_1","//papasfreezeria_2","//papasfreezeria_3"],
        hosts:[
            {
                hostname: "www.coolmathgames.com",
                pathname: "/0-papas-freezeria",
                iframe: ""
            }
        ]
    },
    {
        name:"Papa's Burgeria",
        pathname: "/0-papas-burgeria",
        saveName: "papasburgeria_save",
        saveIdentifier: "10",
        lsKeys: ["//papasburgeria_1","//papasburgeria_2","//papasburgeria_3"],
        hosts:[
            {
                hostname: "www.coolmathgames.com",
                pathname: "/0-papas-bakeria",
                iframe: ""
            },
            {
                hostname: "www.crazygames.com",
                pathname: "/game/papa-s-burgeria",
                iframe: "#game-iframe"
            }
        ]
    },
    {
        name:"Papa's Taco Mia",
        pathname: "/0-papas-taco-mia",
        saveName: "papastacomia_save",
        saveIdentifier: "11",
        lsKeys: ["//papastaqueria_1","//papastaqueria_2","//papastaqueria_3"],
        hosts:[
            {
                hostname: "www.coolmathgames.com",
                pathname: "/0-papas-taco-mia",
                iframe: ""
            }
        ]
    },
    {
        name:"Papa's Pancakeria",
        pathname: "/0-papas-pancakeria",
        saveName: "papaspancakeria_save",
        saveIdentifier: "12",
        lsKeys: ["//papaspancakeria_1","//papaspancakeria_2","//papaspancakeria_3"],
        hosts:[
            {
                hostname: "www.coolmathgames.com",
                pathname: "/0-papas-bakeria",
                iframe: ""
            }
        ]
    },
    {
        name:"Papa's Cupcakeria",
        pathname: "/0-papas-cupcakeria",
        saveName: "papascupcakeria_save",
        saveIdentifier: "13",
        lsKeys: ["//papascupcakeria1","//papascupcakeria2","//papascupcakeria3"],
        hosts:[
            {
                hostname: "www.coolmathgames.com",
                pathname: "/0-papas-bakeria",
                iframe: ""
            }
        ]
    },
    {
        name:"Papa's Cheeseria",
        pathname: "/0-papas-cheeseria",
        saveName: "papascheeseria_save",
        saveIdentifier: "14",
        lsKeys: ["//papascheeseria1","//papascheeseria2","//papascheeseria3"],
        hosts:[
            {
                hostname: "www.coolmathgames.com",
                pathname: "/0-papas-bakeria",
                iframe: ""
            }
        ]
    }
]);
psm.iframeLocations = ["https://games.crazygames.com/en_US/papa-s-burgeria/index.html"];
psm._idCount = 0;
psm.newID = () => {psm._idCount++; return psm._idCount};
psm.lsCallbacks = [];
// [id,callback,date]
psm.game = null;
psm.gameHost = null;

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
    return true;
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
    getSlot(slot,function(e){
        const data = psm.savePrefix + psm.saveVersion + psm.game.saveIdentifier + e;
        const filename = psm.game.saveName + "." + psm.saveExt;
        download(filename,data);
    });

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
    const fileValidity = isValidSave(data);
    const key = psm.game.lsKeys[slot];
    const forceLoad = psm.userOptions.forceImport;
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
    let genHTML = "<h2>Save Manager</h2><p>This save manager allows you to import and export saves to ensure they are never lost. Saves can also be moved between devices. The page may need to be refreshed before imported saves are visible.</p>";
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

    const hostname = psm.gameHost.hostname;
    if(hostname=="www.coolmathgames.com"){
        let parentNode = document.getElementsByClassName("game-meta-body")[0];
        document.getElementsByClassName("node__content clearfix field-item")[0].insertBefore(div,parentNode);
    }
    else if(hostname=="www.crazygames.com"){
        let beforeNode = document.getElementsByClassName("css-1pj32m1")[0];
        document.getElementsByClassName("MuiBox-root css-1ttp6zk")[0].getElementsByTagName("div")[0].insertBefore(div,beforeNode);
    }
    addOnclicks();
}

function getSlot(slot,callback){
    //console.log(slot+callback);
    if(!callback) return;
    if(psm.gameHost.iframe.length>2){
        const entID = psm.newID();
        let callbackEntry = [];
        callbackEntry[0] = entID;
        callbackEntry[1] = callback;
        psm.lsCallbacks.push(callbackEntry);
        const lsKey = String(psm.game.lsKeys[slot]);
        let newMessage = {
            id: entID,
            task: "getLS",
            params: [lsKey]
        };
        console.log(newMessage);
        document.querySelector(psm.gameHost.iframe).contentWindow.postMessage(newMessage,"*");
    }

}

//get host by key value pair. Checks all games
function getHost(key,value){
    let host = null;
    for(let i=0;i<psm.gameList.length;i++){
        let hosts = psm.gameList[i]["hosts"];
        for(let n=0;n<hosts.length;n++){
            if(hosts[n][key]==value){
                host = hosts[n];
                break;
            }
        }
        if(host!=null){
            break;
        }
    }
    return host;
}

// returns singular game object by given key + matching value. Checks host params too
function getGame(key,value){
    let game = null;
    for(let i=0;i<psm.gameList.length;i++){
        if(psm.gameList[i][key]==value){
            game = psm.gameList[i];
            break;
        }
        else{
            for(let n=0;n<psm.gameList[i]["hosts"].length;n++){
                if(psm.gameList[i]["hosts"][n][key]==value){
                    game = psm.gameList[i];
                    break;
                }
            }
            if(game!=null)break; //break nest
        }
    }
    return game;
}

function detectGame(){
    psm.game = getGame("pathname", window.location.pathname);
    psm.gameHost = getHost("pathname", window.location.pathname);
}

//attempt to prevent the game from loading
function blockGame(){
    let wrapper = document.getElementById("swfgamewrapper");
    wrapper.innerHTML = "";
}

function pageAdjustments(){
    document.getElementById("game-fullscreen").onclick = () => cmg_start_game_full_screen();
}

//Receive message from game iframe - handle returned localstorage data
function receiveMessage(event){
    const data = event.data;
    console.log(data);
    if(data.type=="lsReply"){
        for(let i=0;i<psm.lsCallbacks.length;i++){
            let entry = psm.lsCallbacks[i];
            if(entry[0]==data.id) entry[1](data.content); //callback()
        }
    }
}

//Function for when this is injected into iframe
function iframeReceiveMessage(event){
    /*
    data.id
    data.task
    data.params
    */
    const data = event.data;
    if(!data) return;
    let response = {
        id: data.id,
        type: "lsReply",
        content: null
    };
    if(data.task=="getLS"){
        let result = localStorage.getItem(data.params[0]);
        response.content = result;
        window.parent.postMessage(response,"*");
    }
    else if(data.task=="setLS"){
        localStorage.setItem(data.params[0],data.params[1]);
    }
}

function isIframeLocation(){
    const location = window.location.href;
    let result = false;
    for(const loc of psm.iframeLocations){
        if(loc==location){
            result=true;
            break;
        }
    }
    return result;
}

function initialise(){
    if(isIframeLocation()){
        window.addEventListener("message", iframeReceiveMessage, false);
        return;
    }
    window.addEventListener("message", receiveMessage, false);
    detectGame();
    if(psm.userOptions.otherPageAdjustments) pageAdjustments();
    if(psm.userOptions.saveTxtExt) psm.saveExt = "txt";
    if(psm.userOptions.preventGameLoad) blockGame();
    injectCSS(pbsmCSS);
    var interval = setInterval(function(){ //for crazygames doesn't like adding html too early!
	if(document.readyState=="complete"){
		clearInterval(interval);
		generateHTML();
	}
},200);
    //generateHTML();
}

initialise();