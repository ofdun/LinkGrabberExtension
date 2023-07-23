textarea = document.getElementById('textarea');
copyButton = document.getElementById('copy');
clearButton = document.getElementById('clear');
backupButton = document.getElementById('backup');
setButton = document.getElementById('setList');

copyButton.addEventListener("click", copy);
clearButton.addEventListener("dblclick", reset);
backupButton.addEventListener('dblclick', backup);
setButton.addEventListener('dblclick', setManually);

window.addEventListener('load', update_textarea)

function setManually() {
    let list = textarea.value;
    set_list(list);
    update_textarea();
}

async function backup() {
    function get_list_backup() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(["list_backup"], (items) => {
                console.log(items["list_backup"]);
                resolve(items['list_backup']);
            });
        });
    }
    let list = await get_list_backup();
    set_list(list);
    update_textarea();
}

async function reset() {
    let list = await get_list();
    backup_list(list);
    set_list("");
    update_textarea();
}

function backup_list(list) {
    chrome.storage.local.set({
        list_backup: list
    }, () => { });
}

function get_list() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["list"], (items) => {
            console.log(items["list"]);
            resolve(items['list']);
        });
    });
}
/**
   * 
   * @param {string} list 
   * This function sets the list in chrome sync storage
*/
function set_list(list) {
    chrome.storage.local.set({
        list: list
    }, () => { });
}
/**
   * 
   * @param {string} url 
   * This function adds url to a list in chrome sync storage
   */
async function add_to_list(url) {
    let list = await get_list();
    if (list !== "") {
        list += '\n' + url;
    } else {
        list = url;
    }
    set_list(list);
    console.log('Added new link to list');
}

async function update_textarea() {
    let list = await get_list();
    textarea.value = list;
}

function copy() {
    navigator.clipboard.writeText(textarea.value).then(function () {
        console.log('Coppied')
    }, function (err) {
        console.log(err)
    });
}