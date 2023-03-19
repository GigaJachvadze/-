const TABLE_LISTEN_TIMER = 1000;

let savedUsers = [];

let cells;
let cellAmount = 0;

let selectedIndex;

loading = false;

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
    }
}

async function updateUsersFromStorage() {
    loading = true;
    let storage = getUsersFromStorage();
    storage.then((st) => {
        if (!st.users) return;
        savedUsers = JSON.parse(st.users);
        loading = false;
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

function start() {
    document.addEventListener("click", function(e) {
        if (loading) return;

        if (selectedIndex != undefined) {

            // updateUsersFromStorage();

            let state;
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
                state = false;
            } else {
                savedUsers.push(profileId);
                state = true;
            }

            // savedUsers = [];

            let savedUsersString = JSON.stringify(savedUsers);

            loading = true;

            chrome.storage.local.set({ users: savedUsersString }).then(() => {
                state? console.log("steamId: " + profileId + " is added to list") : console.log("steamId: " + profileId + " is removed from list");
                console.log(savedUsers);
                updateUsersFromStorage();
                console.log(savedUsers);
                loading = false;
                updateVisuals();
            });


        }
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