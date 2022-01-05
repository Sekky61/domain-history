let history_res = [];

const entries = [1, 2, 3, 4];

const PARENT_CONTEXT_ID = "RECENT_MAIN";

function history_item_clicked(info, tab) {
    chrome.tabs.create({ url: history_res[info.menuItemId].url });
}

function create_parent_context_menu() {
    chrome.contextMenus.create({
        title: "Recent history",
        contexts: ["page"],
        id: PARENT_CONTEXT_ID
    });
}

chrome.contextMenus.onClicked.addListener(history_item_clicked);

async function get_history(hostname) {
    return chrome.history.search(
        {
            text: hostname,
            maxResults: 15
        }
    );
}

function apply_history(history) {
    for (let index = 0; index < history.length; index++) {
        let title = history[index].title;
        let max_len = 50;
        if (title.length > max_len) {
            title = title.slice(0, max_len) + "...";
        }
        chrome.contextMenus.create({
            title: title,
            contexts: ["page"],
            id: "" + index,
            parentId: PARENT_CONTEXT_ID
        });
    }
}

async function get_and_set_history(hostname) {
    history_res = await get_history(hostname);

    apply_history(history_res);
}

function tab_changed(activeInfo) {
    chrome.contextMenus.removeAll();
    create_parent_context_menu();

    let tab_id = activeInfo.tabId;
    chrome.tabs.get(
        tab_id,
        async tab => {
            let url = tab.url;
            // use `url` here inside the callback because it's asynchronous!

            let hostname = (new URL(url)).hostname;

            get_and_set_history(hostname);
        });
}

chrome.tabs.onActivated.addListener(tab_changed);
