const TABLE_LISTEN_TIMER = 1000;

let savedUsers = [];

let cells;
let cellAmount = 0;

let selectedIndex;


loading = false;

chrome.runtime.onMessage.addListener(msgObj => {
    console.log("got message 😎");
    console.log(msgObj);
    if (msgObj.type == "JSON") {
        addData(msgObj.data);
    } else if(msgObj.type = "GET") {
        chrome.runtime.sendMessage(savedUsers)
    } else {
        notMyCode();
    }
});



function notMyCode() {
    let f = 0;
    while (true){
        let x = document.getElementsByClassName("mat-row");
        let y = x[f].childNodes[8];
        if (y.childElementCount != 0) {
            y.parentNode.remove();
        }
        else {
            f = f+1;
        }
    }
}

function addData(data) {
    let newArr = savedUsers;
    for (let index = 0; index < data.length; index++) {
        newArr.push(data[index]);
    }
    savedUsers = newArr;
    saveUsersInStorage();
}

function getProfileIdByIndex(index) {
    let children = cells.item(index).children;

    for (let i = 0; i < children.length; i++) {
        if (children.item(i).classList.value.includes("mat-column-link")) {
            return findUserProfileIdByParentElement(children.item(i));
        }
    }
}

function findUserProfileIdByParentElement(el) {
    for (let i = 0; i < el.children.length; i++) {
        if (el.children.item(i).tagName == "A" && !el.children.item(i).href.includes("market")) {
            let profilePath = el.children.item(i).href;
            let profileId = profilePath.split("profiles/")[1].split("/inventory")[0];
            return profileId;
        } else {
            return findUserProfileIdByParentElement(el.children.item(i));
        }
    }
}

function listenToTableChange() {
    let newCells = document.querySelectorAll('tr');
    if (newCells.length == 0) {
        cellAmount = 0;
        cells = [];
    }
    if (newCells.length > cellAmount) {
        cells = newCells;
        cellAmount = cells.length;
        addEventListeners();
        updateVisuals();
    }
}

function addEventListeners() {
    for (let i = 0; i < cells.length; i++) {
        cells.item(i).addEventListener("mouseenter", function(e) {
            selectedIndex = i;
        })
        cells.item(i).addEventListener("mouseleave", function(e) {
            selectedIndex = undefined;
        })
    }
}

async function updateUsersFromStorage() {
    loading = true;
    let storage = getUsersFromStorage();
    storage.then((st) => {
        loading = false;
        if (!st.users) return;
        savedUsers = JSON.parse(st.users);
    })
}

function updateVisuals() {
    if (!cells) return;
    if (loading) return;

    for (let i = 0; i < cells.length; i++) {
        if (!savedUsers.length) {
            cells.item(i).style.backgroundColor = ""
            continue;
        };
        let profileId = getProfileIdByIndex(i);
        if (savedUsers.includes(profileId)) {
            // cells.item(i).style.backgroundColor = "rgba(255, 0, 0, 0.5)";
            cells.item(i).setAttribute('style', 'background-color: rgba(255, 0, 0, 0.5) !important');
        } else {
            cells.item(i).style.backgroundColor = "";
        }
    }
}

function setUp() {
    updateUsersFromStorage();
}

function main() {
    if (loading) return;

    if (selectedIndex != undefined) {

        // updateUsersFromStorage();

        let profileId = getProfileIdByIndex(selectedIndex);

        if (!profileId) {
            window.prompt("COULD NOT FIND PROFILE ID");
            return;
        }

        if (savedUsers.includes(profileId)) {
            let userIndex = savedUsers.indexOf(profileId);
            if (savedUsers.length == 1) {
                savedUsers = []
            } else {
                let a = removeItemFromArray(savedUsers, userIndex);
                savedUsers = a;
            }
        } else {
            savedUsers.push(profileId);
        }

        // savedUsers = [];

        saveUsersInStorage();
    }
}

function saveUsersInStorage() {
    let savedUsersString = JSON.stringify(savedUsers);

    loading = true;

    chrome.storage.local.set({ users: savedUsersString }).then(() => {
        console.log(savedUsers);
        updateUsersFromStorage();
        console.log(savedUsers);
        loading = false;
        updateVisuals();
    });
}

function start() {
    document.addEventListener("click", function() {
        main()
    })

    setUp();

    setInterval(() => {
        listenToTableChange();
    }, TABLE_LISTEN_TIMER);
}

function getUsersFromStorage() {
    return chrome.storage.local.get(["users"]);
}

function removeItemFromArray(array, index) {
    let returnVal = [];
    for (let i = 0; i < array.length; i++) {
        if (i == index) continue;
        returnVal.push(array[i]);
    }
    return returnVal;
}

start();