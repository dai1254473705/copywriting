/**
 * 弹出框代码
 */
const DATABASENAME = 'DataBase';
const tagList = [
    'weibiaoti-2_fuzhi_aixin',
    'weibiaoti-2_fuzhi_caiqiu',
    'weibiaoti-2_fuzhi_guoshi',
    'weibiaoti-2_fuzhi_kafeibei',
    'weibiaoti-2_fuzhi_lazhu',
    'weibiaoti-2_fuzhi_lingdang',
    'weibiaoti-2_fuzhi_shengdanmao',
    'weibiaoti-2_fuzhi_shengdanshu',
    'weibiaoti-2_fuzhi_shoutao',
    'weibiaoti-2_fuzhi_tangguo',
    'weibiaoti-2_fuzhi_wanjuwawa',
    'weibiaoti-2_fuzhi_wazi-30',
    'weibiaoti-2_fuzhi_xuehua',
    'weibiaoti-2_fuzhi_xueren',
];
let currentEditIndex = null;
const $ = (selector) => {
    return document.querySelector(selector);
}

const hideDom = (dom) => {
    $(dom).classList.add('hidden');
}
const showDom = (dom) => {
    $(dom).classList.remove('hidden');
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
 * 更新 dom
 */
const updateDom = async () => {
    // 清空
    $('#li_template').innerHTML = '';
    const storage = await chrome.storage.sync.get([DATABASENAME]);
    const dataBase = storage[DATABASENAME];
    // 设置占位图显示隐藏
    if (dataBase.length === 0) {
        showDom('.empyt-container')
        hideDom('.list-group')
    } else {
        showDom('.list-group')
        hideDom('.empyt-container')
    }
    // alert(JSON.stringify(dataBase));
    // const dataBase = [{ "id": 0, "text": "用户点击插件图标以后出现的弹窗，我们定一个 html 模版页面。", "time": 1723190333100 }, { "id": 1, "text": "接着引入组件相关页面。", "time": 1723190338162 }];
    const container = document.querySelector('#li_template');
    dataBase.map((item, index) => {
        container.appendChild(tpl(item.id, index, item.text));
    })
}

function delegateEventListener(parentId, eventType, selector, callback) {
    const parent = document.getElementById(parentId);
    parent.addEventListener(eventType, (e) => {
        let target = e.target;
        while (target && target !== parent) {
            if (target.classList.contains(selector)) {
                callback(target);
                break;
            }
            target = target.parentNode;
        }
    }, false);
}

const tpl = (id, index, text) => {
    // const imgName = Math.floor(Math.random() * tagList.length);
    // <img class="svg-icon" src="../svg/${tagList[imgName]}.svg">
    const html = `<span class="top-tag">${Number(index) + 1}</span><div class="list-item-left">
            <span class="list-index">
                <span class="paixu-shang paixu" data-type="up"  data-index="${index}"></span>
                <span class="paixu-xia paixu" data-type="down" data-index="${index}"></span>
            </span>
            <span class="list-text">${text}</span>
          </div>
          <div class="list-item-right">
            <span class="list-item-action edit" data-id="${id}" data-index="${index}" title="修改"><img class="svg-icon" src="../svg/edit.svg"><span class="icon-text hidden">修改</span></span>
            <span class="list-item-action delete" data-index="${index}" title="删除"><img class="svg-icon" src="../svg/shanchu.svg"><span class="icon-text hidden">删除</span></span>
            <span class="list-item-action copy" data-index="${index}" title="复制"><img class="svg-icon" src="../svg/fuzhi.svg"><span class="icon-text hidden">复制</span></span>
          </div>`;
    const tempDiv = document.createElement('li');
    tempDiv.className = 'list-item';
    tempDiv.innerHTML = html;
    return tempDiv;
}

function doCopy(text, callback) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(
            () => {
                callback && callback('success');
            },
            () => {
                callback && callback('fail');
            }
        );
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            callback && callback('success');
        } catch (err) {
            callback && callback('fail');
        }
        document.body.removeChild(textArea);
    }
}
/**
 * 批量删除
 */
document.querySelector("#batchDelete").addEventListener("click", async () => {
    await chrome.storage.sync.set({ [DATABASENAME]: [] })
    chrome.notifications.create({
        type: 'basic',
        iconUrl: '../images/notice.png',
        title: '批量删除成功',
        message: "快去新增文案吧～",
        priority: 0
    });
    updateBadge();
    updateDom();
});

/**
 * 单个删除
 */
delegateEventListener('li_template', 'click', 'delete', async (target) => {
    const index = target.getAttribute('data-index');
    console.log(index);
    const storage = await chrome.storage.sync.get([DATABASENAME]);
    const dataBase = storage[DATABASENAME];
    // 其他相关处理逻辑
    dataBase.splice(index, 1);
    await chrome.storage.sync.set({ [DATABASENAME]: dataBase })
    chrome.notifications.create({
        type: 'basic',
        iconUrl: '../images/notice.png',
        title: '删除成功',
        message: `删除成功第${+index + 1}条文案,剩余${dataBase.length}条文案,快去新增文案吧～`,
        priority: 0
    });
    updateBadge();
    updateDom();
});



/**
 * 批量复制
 */
document.querySelector("#batchCopy").addEventListener("click", async () => {
    console.log('====click======');
    const storage = await chrome.storage.sync.get([DATABASENAME]);
    const dataBase = storage[DATABASENAME];

    let datalist = ``;
    dataBase.map(item => {
        datalist += `${item.text}\n`;
    })
    doCopy(datalist, () => {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: '../images/success.png',
            title: '复制成功',
            message: "快去粘贴吧～",
            priority: 0
        });
    })
});

/**
 * 单个复制
 */
delegateEventListener('li_template', 'click', 'copy', async (target) => {
    const index = target.getAttribute('data-index');
    console.log(index);
    const storage = await chrome.storage.sync.get([DATABASENAME]);
    const dataBase = storage[DATABASENAME];
    const text = dataBase[index].text;
    doCopy(text, () => {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: '../images/success.png',
            title: '复制成功',
            message: "快去粘贴吧～",
            priority: 0
        });
    })
});

/**
 * 单个编辑
 */
delegateEventListener('li_template', 'click', 'edit', async (target) => {
    const index = target.getAttribute('data-index');
    const id = target.getAttribute('data-id');
    console.log(index);
    const storage = await chrome.storage.sync.get([DATABASENAME]);
    const dataBase = storage[DATABASENAME];
    const text = dataBase[index].text;
    currentEditIndex = index;
    $('textarea').value = text;
    $('.submitTextName').innerHTML = `编辑(${Number(index) + 1})`;
});
const addToStore = async (text) => {
    const storage = await chrome.storage.sync.get([DATABASENAME]);
    const dataBase = storage[DATABASENAME];
    // 编辑
    if (currentEditIndex !== null) {
        dataBase[currentEditIndex].text = text;
        dataBase[currentEditIndex].time = new Date().getTime();
        currentEditIndex = null;
        $('.submitTextName').innerHTML = `新增`;
    } else {
        dataBase.push({
            id: dataBase.length,
            text: text,
            time: new Date().getTime()
        });
    }
    await chrome.storage.sync.set({ [DATABASENAME]: dataBase });
}

const updataTextarea = async () => {
    const text = $('textarea').value.trim();
    if (!text) {
        return;
    }
    $('textarea').value = '';
    $('textarea').focus();
    await addToStore(text);
    updateDom();
    await updateBadge();
}
/**
 * 输入内容
 */
$('#submitText').onclick = async (e) => {
    updataTextarea();
}
document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && event.metaKey) {
        // 当 command + enter 被按下时的操作
        updataTextarea();
    }
});


/**
 * 排序
 */
delegateEventListener('li_template', 'click', 'paixu', async (target) => {
    const type = target.getAttribute('data-type'); // up || down
    const index = target.getAttribute('data-index');
    console.log(index);
    const storage = await chrome.storage.sync.get([DATABASENAME]);
    const dataBase = storage[DATABASENAME];
    const newIndex = type === 'up' ? (index == 0 ? 0 : index - 1) : (index == dataBase.length - 1 ? dataBase.length - 1 : Number(index) + 1);
    if (Number(newIndex) === Number(index)) {
        return;
    }
    const catchData = dataBase[newIndex];
    dataBase[newIndex] = dataBase[index];
    dataBase[index] = catchData;
    await chrome.storage.sync.set({ [DATABASENAME]: dataBase })
    updateDom();
});


(async function () {
    updateDom();
    updateBadge();
})()
