const electron = require("electron");
const { app, BrowserWindow, ipcMain, Menu } = electron;
const fs = require("fs");
const fse = require("fs-extra");
const contextMenu = require("electron-context-menu");
const dialog = electron.dialog;
const pretty = require("prettysize");
const mime = require("mime-types");

/*------------------------------------
--------- APP CONFIGURATION ----------
-------------------------------------*/

let mainWindow;
app.on("ready", () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  mainWindow.on("closed", () => app.quit());

  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(mainMenu);
});

/*-----------------------------------------
------------- SORT BY DATE ----------------
------------------------------------------*/
ipcMain.on("sort:date", (event, selectedPath) => {
  fs.readdir(selectedPath, async function(err, files) {
    if (err) {
      return console.error(err);
    }
    await files.forEach(function(file) {
      fs.stat(selectedPath + "\\" + file, function(err, stats) {
        if (err) {
          return console.error(err);
        }

        var atime = new Date(stats.atimeMs);
        var createdDate = new Date(stats.birthtime).toString().slice(3, 15);
        console.log(
          "Name: " +
            file +
            " Size: " +
            pretty(stats.size) +
            " Access time:" +
            atime.getTime() +
            " created on: " +
            createdDate
        );

        const srcpath = selectedPath + "\\" + file;
        const dstpath = selectedPath + "\\" + createdDate + "\\" + file;

        // With a callback:
        fse.move(srcpath, dstpath, err => {
          if (err) return console.error(err);

          console.log("success!");
        });
      });
    });

    mainWindow.webContents.send("sort:dateDone");
  });
});

/*------------------------------------------
------------- SORT BY MONTH ----------------
-------------------------------------------*/
ipcMain.on("sort:month", (event, selectedPath) => {
  fs.readdir(selectedPath, async function(err, files) {
    if (err) {
      return console.error(err);
    }
    await files.forEach(function(file) {
      fs.stat(selectedPath + "\\" + file, function(err, stats) {
        if (err) {
          return console.error(err);
        }
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December"
        ];
        var atime = new Date(stats.atimeMs);
        var createdDate = new Date(stats.birthtime);
        var month = monthNames[createdDate.getMonth()];
        var year = createdDate.getUTCFullYear();
        var folder = month + " " + year;
        console.log(
          "Name: " +
            file +
            " Size: " +
            pretty(stats.size) +
            " Access time:" +
            atime.getTime() +
            " created on: " +
            folder
        );

        const srcpath = selectedPath + "\\" + file;
        const dstpath = selectedPath + "\\" + folder + "\\" + file;

        // With a callback:
        fse.move(srcpath, dstpath, err => {
          if (err) return console.error(err);

          console.log("success!");
        });
      });
    });

    mainWindow.webContents.send("sort:monthDone");
  });
});

/*------------------------------------------
------------- SORT BY YEAR ----------------
-------------------------------------------*/

ipcMain.on("sort:year", (event, selectedPath) => {
  fs.readdir(selectedPath, async function(err, files) {
    if (err) {
      return console.error(err);
    }
    await files.forEach(function(file) {
      fs.stat(selectedPath + "\\" + file, function(err, stats) {
        if (err) {
          return console.error(err);
        }

        var atime = new Date(stats.atimeMs);
        var createdDate = new Date(stats.birthtime);
        var year = createdDate.getUTCFullYear();
        console.log(
          "Name: " +
            file +
            " Size: " +
            pretty(stats.size) +
            " Access time:" +
            atime.getTime() +
            " created on: " +
            createdDate
        );

        const srcpath = selectedPath + "\\" + file;
        const dstpath = selectedPath + "\\" + year + "\\" + file;

        // With a callback:
        fse.move(srcpath, dstpath, err => {
          if (err) return console.error(err);

          console.log("success!");
        });
      });
    });

    mainWindow.webContents.send("sort:yearDone");
  });
});

/*------------------------------------------
------------- SORT BY USAGE ----------------
-------------------------------------------*/

ipcMain.on("sort:usage", (event, selectedPath) => {
  fs.readdir(selectedPath, async function(err, files) {
    if (err) {
      return console.error(err);
    }
    await files.forEach(function(file) {
      fs.stat(selectedPath + "\\" + file, function(err, stats) {
        if (err) {
          return console.error(err);
        }

        var mtime = new Date(stats.atimeMs);
        var now = new Date();
        var z = new Date(now.getTime() - mtime.getTime());

        //CALCULATE HOW LONG SINCE LAST ACCESS
        var days = Math.round(z.getTime() / (1000 * 60 * 60 * 24));

        //FREQUENT
        if (days <= 30) {
          const srcpath = selectedPath + "\\" + file;
          const dstpath = selectedPath + "\\" + "Frequently Used" + "\\" + file;

          // With a callback:
          fse.move(srcpath, dstpath, err => {
            if (err) return console.error(err);

            console.log("success!");
          });
        }
        //OCCASIONAL
        else if (days >= 30 && days <= 365) {
          fs.stat(selectedPath + "\\" + file, function(err, stats) {
            if (err) {
              return console.error(err);
            } else if (stats.isDirectory()) {
              const srcpath = selectedPath + "\\" + file;
              const dstpath = selectedPath + "\\" + "Folders" + "\\" + file;

              // With a callback:
              fse.move(srcpath, dstpath, err => {
                if (err) return console.error(err);

                console.log("success!");
              });
            } else {
              const srcpath = selectedPath + "\\" + file;
              const dstpath = selectedPath + "\\" + "Others" + "\\" + file;

              // With a callback:
              fse.move(srcpath, dstpath, err => {
                if (err) return console.error(err);

                console.log("success!");
              });
            }
          });
        }
        // RARE
        else if (days >= 365) {
          const srcpath = selectedPath + "\\" + file;
          const dstpath = selectedPath + "\\" + "Rarelly Used" + "\\" + file;

          // With a callback:
          fse.move(srcpath, dstpath, err => {
            if (err) return console.error(err);

            console.log("success!");
          });
        }
      });
    });

    mainWindow.webContents.send("sort:usageDone");
  });
});

/*------------------------------------------
------------- SORT BY FILE TYPE ----------------
-------------------------------------------*/

ipcMain.on("sort:ext", (event, selectedPath) => {
  fs.readdir(selectedPath, async function(err, files) {
    if (err) {
      return console.error(err);
    }
    await files.forEach(function(file) {
      var x = mime.lookup(selectedPath + "\\" + file);
      if (x) {
        const srcpath = selectedPath + "\\" + file;
        const dstpath = selectedPath + "\\" + x + "\\" + file;

        // With a callback:
        fse.move(srcpath, dstpath, err => {
          if (err) return console.error(err);

          console.log("success!");
        });
      } else {
        const srcpath = selectedPath + "\\" + file;
        const dstpath = selectedPath + "\\" + "Others" + "\\" + file;

        // With a callback:
        fse.move(srcpath, dstpath, err => {
          if (err) return console.error(err);

          console.log("success!");
        });
      }
    });

    mainWindow.webContents.send("sort:extDone");
  });
});

/*--------------------------------------
---------- MENU CUSTOMISATION ----------
---------------------------------------*/

contextMenu({
  showInspectElement: true
});

const menuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "Quit",
        accelerator: process.platform === "darwin" ? "Command+Q" : "Ctrl+Q",
        click() {
          app.quit();
        }
      }
    ]
  }
];

if (process.platform === "darwin") {
  menuTemplate.unshift({});
}

if (process.env.NODE_ENV !== "production") {
  menuTemplate.push({
    label: "View",
    submenu: [
      { role: "reload" },
      {
        label: "Toggle Developer Tools",
        accelerator:
          process.platform === "darwin" ? "Command+Alt+I" : "Ctrl+Shift+I",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      }
    ]
  });
}

exports.selectDirectory = function() {
  const path = dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"]
  });

  return path;
};
