// DON'T FORGET THAT THIS EXECUTES NOT IN BACKGROUND AREA
/**
 * 
 * @param {string} url - url to save to chrome sync storage
 * This function saves the given url to the chrome sync storage
 */
function saveLink(url) {
  function get_list() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(["list"], (items) => {
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
    chrome.storage.sync.set({
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
  chrome.runtime.sendMessage({
    notification: "true",
    url: url
  });
  console.log(`current url is ${url}`);
  add_to_list(url);
}

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

chrome.commands.onCommand.addListener(async (command) => {
  if (command == 'KeyPressed') {
    let currentTab = await getCurrentTab();
    chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: saveLink,
      args: [currentTab.url]
    });
  }
});
/**
 * 
 * @param {string} url 
 * This function creates notification with given url
 */
async function createNotif(url) {
  function callback() {
    console.log('notification was sent')
  }

  var opt = {
    type: "basic",
    title: "TikTok Grabber",
    message: `${url} was saved`,
    iconUrl: "icon/icon.png",
    priority: 1
  };

  await chrome.notifications.create(`notification-${Date.now()}`, opt, callback);
}
/**
 * 
 * @param {string} string 
 * @returns {string}
 * This function changes the url to look more fancy
 */
function truncate(string) {
  const len = string.length
  const name = `"${string.slice(12, 25)}...${string.slice(len - 7)}"`
  return name
}

chrome.runtime.onMessage.addListener(
  async function (request, sender, sendResponse) {
    if (request.notification === "true") {
      const naming = truncate(request.url);
      createNotif(naming);
      sendResponse({ response: "notification sent" });
    }
  });