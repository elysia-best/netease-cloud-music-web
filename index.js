const electron = require('electron');
const Menu = electron.Menu
// 控制应用生命周期的模块
const { app, Tray } = electron;
// 创建本地浏览器窗口的模块
const { BrowserWindow } = electron;

const path = require('path');

// 指向窗口对象的一个全局引用，如果没有这个引用，那么当该javascript对象被垃圾回收的
// 时候该窗口将会自动关闭
let win;

function createWindow() {
    // 隐藏菜单栏
    console.log('__dirname : ' + __dirname); // 输出运行文件所在的目录

    Menu.setApplicationMenu(null);

    // 创建一个新的浏览器窗口
    win = new BrowserWindow({
        width: 1366,
        height: 768,
        show: false,
        autoHideMenuBar: true,
        icon: path.join(__dirname + './assets/icons/icon.png')
    });

    // 并且装载应用的index.html页面
    win.loadURL(`https://music.163.com/st/webplayer`);
    // 打开开发工具页面，测试用
    // win.webContents.openDevTools();

    win.on('close', (event) => {
        // 截获 close 默认行为
        event.preventDefault();
        // 点击关闭时触发close事件，我们按照之前的思路在关闭时，隐藏窗口，隐藏任务栏窗口
        win.hide();
        win.setSkipTaskbar(true);
    })
    // 当窗口关闭时调用的方法
    win.on('closed', () => {
        // 解除窗口对象的引用，通常而言如果应用支持多个窗口的话，你会在一个数组里
        // 存放窗口对象，在窗口关闭的时候应当删除相应的元素。
        win = null;
    });
    win.webContents.on('did-finish-load', () => {
        // TODO: 修改网易云字体，很丑的方法，但是有效
        let command = 'javascript:Array.prototype.forEach.call(document.getElementsByTagName("*"),function(e){e.style.fontFamily ="微软雅黑, Noto\ Sans\ CJK\ SC, arial, Segoe\ UI\ Emoji, Segoe\ UI\ Symbol, sans-serif, simsun, Mongolian\ Baiti"})';
        win.webContents.executeJavaScript(command);
    }
    )
    // 加载完成后弹出主界面
    win.once('ready-to-show', () => {

        win.setTitle("网易云音乐");
        win.show();
    });
}

// 当Electron完成初始化并且已经创建了浏览器窗口，则该方法将会被调用。
// 有些API只能在该事件发生后才能被使用。
app.on('ready', createWindow);

// 当所有的窗口被关闭后退出应用
app.on('window-all-closed', () => {
    // 对于OS X系统，应用和相应的菜单栏会一直激活直到用户通过Cmd + Q显式退出
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // 对于OS X系统，当dock图标被点击后会重新创建一个app窗口，并且不会有其他
    // 窗口打开
    if (win === null) {
        createWindow(); 
    }
});

function find_element_by_xpath(STR_XPATH) {
    var xresult = document.evaluate(STR_XPATH, document, null, XPathResult.ANY_TYPE, null);
    var xnodes = [];
    var xres;
    while (xres = xresult.iterateNext()) {
        xnodes.push(xres);
    }

    return xnodes;
}

// 设置托盘
let tray = null;
app.whenReady().then(() => {
    tray = new Tray(__dirname + '/assets/icons/icon.png');
    const contextMenu = Menu.buildFromTemplate([{
        label: '显示主界面',
        click: () => { win.show() }
    },
    {
        label: '播放/暂停', 
        click: () => { win.webContents.executeJavaScript('document.querySelector("#btn_pc_minibar_play").click()'); }
    },
    {
        label: '上一首', 
        click: () => { win.webContents.executeJavaScript(`document.evaluate('//*[@id="page_pc_mini_bar"]/div/div[2]/div[1]/button[2]', document, null, XPathResult.ANY_TYPE, null).iterateNext().click()`); }
    },
    {
        label: '下一首', 
        click: () => { win.webContents.executeJavaScript(`document.evaluate('//*[@id="page_pc_mini_bar"]/div/div[2]/div[1]/button[4]', document, null, XPathResult.ANY_TYPE, null).iterateNext().click()`); }
    },
    {
        label: '退出程序',
        click: () => { win.destroy() }
    }
    ]);
    tray.setToolTip('网易云音乐')
    tray.setContextMenu(contextMenu)
    // 双击触发
    tray.on('click', () => {
        // 双击通知区图标实现应用的显示或隐藏
        win.isVisible() ? win.hide() : win.show()
        win.isVisible() ? win.setSkipTaskbar(false) : win.setSkipTaskbar(true);
    });
})
