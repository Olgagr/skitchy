import { app, BrowserWindow, globalShortcut, ipcMain, dialog, Menu, shell } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { enableLiveReload } from 'electron-compile';
import childProcess from 'child_process';
import path from 'path';
import fs from 'fs';
import { APP_EVENTS } from './constants';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let screenshotLoaded = false;

const isDevMode = process.execPath.match(/[\\/]electron/);

if (isDevMode) enableLiveReload({ strategy: 'react-hmr' });

function takeScreenshot() {
  const screenshotPath = path.join(app.getPath('temp'), `${Date.now()}.jpg`);
  const process = childProcess.spawn(path.join(__dirname, 'bin', 'maim'), ['-s', screenshotPath]);
  process.on('close', () => {
    mainWindow.webContents.send(APP_EVENTS.LOAD_SCREENSHOT_PREVIEW, screenshotPath);
  });
}

const createMainWindow = async () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'assets/icons/logo_small.png'),
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  if (isDevMode) {
    await installExtension(REACT_DEVELOPER_TOOLS);
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  // Shortcuts
  const takeScreenshotShortcut = globalShortcut.register('CommandOrControl+Shift+L', () => {
    if (screenshotLoaded) {
      const response = dialog.showMessageBox({
        type: 'question',
        title: 'Warning',
        buttons: ['Cancel', 'Yes'],
        message: 'Are you sure you want to load a new screenshot?',
      });
      if (response === 1) takeScreenshot();
    } else {
      takeScreenshot();
    }
  });

  if (!takeScreenshotShortcut) console.error('Take screeshot shortcut was not registred');

  const deleteBtnShortcut = globalShortcut.register('Delete', () =>
    mainWindow.webContents.send(APP_EVENTS.DELETE_BUTTON_PRESSED)
  );

  if (!deleteBtnShortcut) console.error('Delete button shortcut was not registered');

  // events
  ipcMain.on(APP_EVENTS.SAVE_TO_FILE, (event, data) => {
    const file = dialog.showSaveDialog({
      title: 'Save image',
      defaultPath: app.getPath('pictures'),
      filters: [{ name: 'png files', extentions: ['png'] }],
    });
    if (!file) return;

    fs.writeFile(file, data, 'base64', (err) => {
      console.error(err);
    });
  });

  // eslint-disable-next-line no-return-assign
  ipcMain.on(APP_EVENTS.SCREENSHOT_LOADED, () => (screenshotLoaded = true));
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createMainWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createMainWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// Menu
const menuTemplate = [
  {
    label: '&File',
    submenu: [
      {
        label: 'Save as PNG',
        accelerator: 'CommandOrControl+S',
        click() {
          mainWindow.webContents.send(APP_EVENTS.GET_CANVAS_DATA_TO_SAVE);
        },
      },
      {
        label: 'Quit',
        role: 'quit',
      },
    ],
  },
  {
    label: '&Window',
    submenu: [
      {
        label: 'Minimaze',
        role: 'minimize',
      },
    ],
  },
  {
    label: '&Help',
    submenu: [
      {
        label: 'Documentation',
        click() {
          shell.openExternal('https://github.com/Olgagr/skitchy');
        },
      },
    ],
  },
];

const applicationMenu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(applicationMenu);
