/**
 * @description 处理和监听浏览器事件，相当于是在后台持续运行的脚本，可以使用浏览器的全部api；但是不能和页面内容直接交互。
 */

/**
 * 基础配置信息
 */
const DATABASENAME = 'DataBase';

/**
 * 初始化本地存储
 */
const initDataBase = () => {
    chrome.storage.sync.set({ [DATABASENAME]: [] }).then(() => {
        console.log(`DataBase: ${DATABASENAME} has been created.`);
    });
}
const updateBadge = async () => {
    const storage = await chrome.storage.sync.get([DATABASENAME]);
    const dataBase = storage[DATABASENAME];
    const num = dataBase.length || 0;
    chrome.action.setBadgeText({
        text: String(num),
    });
}
/**
 * 初始化右键菜单
 */
const initContextMenu = () => {
    // chrome.notification.requestPermission()
    chrome.contextMenus.create({
        id: "add",
        type: "normal",
        title: "新增语录",
        contexts: ['selection'],
    });
    console.log(`ContextMenus has been created.`);
}

/**
 * 初始化角标
 */
const initBadge = () => {
    chrome.action.setBadgeText({
        text: "0",
    });
    // chrome.action.setBadgeBackgroundColor({ color: '#fe9739' }); // 配置背景颜色
    console.log(`Badge has been created.`);

}
/**
 * 监听插件安装完成
 */
chrome.runtime.onInstalled.addListener(() => {
    initDataBase();
    initBadge();
    initContextMenu();
});

/**
 * 监听 content 发送的消息
 */
chrome.runtime.onMessage.addListener(async(message, sender, sendResponse) => {
    console.log(message, '======add message====');
    const storage = await chrome.storage.sync.get([DATABASENAME]);
    const dataBase = storage[DATABASENAME];
    if (message.type === 'setBadgeText') {
        await updateBadge();
        setTimeout(() => {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: '../images/bang.png',
                title: '添加文案成功',
                message: `当前共${dataBase.length}条文案～`,
                priority: 0
            });
        }, 100);
       
    }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    const text = info.selectionText;
    const storage = await chrome.storage.sync.get([DATABASENAME]);
    const dataBase = storage[DATABASENAME];
    dataBase.push({
        id: dataBase.length,
        text: text,
        time: new Date().getTime()
    });
    await chrome.storage.sync.set({ [DATABASENAME]: dataBase })
    chrome.notifications.create({
        type: 'basic',
        iconUrl: '../images/bang.png',
        title: '添加文案成功',
        message: `当前共${dataBase.length}条文案～`,
        // buttons: [{ title: 'Keep it Flowing.' }],
        priority: 0
    });
    updateBadge();
});



/**
 * 本地存储
 */
// chrome.storage.onChanged.addListener((changes, namespace) => {
//     for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
//         console.log(
//             `Storage key "${key}" in namespace "${namespace}" changed.`,
//             `Old value was "${oldValue}", new value is "${newValue}".`
//         );
//     }
// });
// chrome.storage.local.set({ key: '助手' }).then(() => {
//     console.log("Value is set");
// });

// chrome.storage.local.get(["key"]).then((result) => {
//     console.log("Value currently is " + result.key);
// });

// chrome.storage.local.set({ key: '助手123' }).then(() => {
//     console.log("Value is set");
// });

