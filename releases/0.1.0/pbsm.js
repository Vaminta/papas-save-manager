// ==UserScript==
// @name        Papa's Bakeria Save Manager
// @namespace   vaminta
// @match       https://www.coolmathgames.com/0-papas-bakeria
// @grant       none
// @version     0.1.0
// @author      Vaminta
// @run-at      document-idle
// @description Allows you to backup your Papa's Bakeria save data on coolmathgames.com
// ==/UserScript==

//31/07/2023, 17:49:11, 28/08

const pbsmOptions = {
    preventGameLoad: false
};

const lsKeys = ["//papasbakeria1","//papasbakeria2","//papasbakeria3"]; //localstorage keys

function slotHasSave(slot){
    let result = false;
    const data = localStorage.getItem(lsKeys[slot]);
    if(data!=null&&data.length>20) result = true;
    return result;
}

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
    const data = localStorage.getItem(lsKeys[slot]);
    download("papabakeria_save_"+slot+".txt",data);
}

function importSave(slot){
    if(slotHasSave(slot)){
        let overwrite = confirm("There is already data in slot " + (slot+1) + ". Are you sure you want to overwrite?");
        if(!overwrite) return;
    }
    const file = document.getElementById("file-picker").files[0];
    const reader = new FileReader();
    reader.addEventListener("load",function(){
        localStorage.setItem(lsKeys[slot],reader.result);
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
    footerP.style = "font-size:10px; margin: 1% 0% 0% 0%;";
    footerP.innerHTML = "version: 0.1.0 ・ Software provided without warranty"
    div.appendChild(footerP);

    let parentNode = document.getElementsByClassName("game-meta-body")[0];
    document.getElementsByClassName("node__content clearfix field-item")[0].insertBefore(div,parentNode);
    addOnclicks();
}

//Prevent the game from loading
function blockGame(){
    let wrapper = document.getElementById("swfgamewrapper");
    wrapper.innerHTML = "";
    //document.getElementsByClassName("loadingText")[0].innerHTML = "The game has been prevented from loading due to Save Manager options.";
}

function initialise(){
    if(pbsmOptions.preventGameLoad) blockGame();
    generateHTML();
}

initialise();

/*
var interval = setInterval(function(){
    if(document.readyState=="complete"){
		 clearInterval(interval);
           initialise();
	 }
 },1000);
 */