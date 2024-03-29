"use strict";

const path = require("path");
const fs = require("fs");
var NodeHelper = require("node_helper");
const pm2 = require("pm2");

var logLibrespot = (...args) => { /* do nothing */ };

module.exports = NodeHelper.create({
  start () {
    this.pm2= null;
  },

  stop () {
    console.log("[LIBRESPOT] Try to close Librespot!");
    this.pm2.stop("librespot", (e,p) => {
      if (e) {
        console.error("[LIBRESPOT] Error: Librespot can't stop !");
        console.error("[LIBRESPOT] Detail:", e);
      }
    });
  },

  socketNotificationReceived (noti, payload) {
    switch (noti) {
      case "INIT":
        this.config= payload;
        console.log("[LIBRESPOT] EXT-Librespot Version:", require("./package.json").version, "rev:", require("./package.json").rev);
        this.initialize();
        break;
      case "PLAYER-RECONNECT":
        this.LibrespotRestart();
        break;
      case "PLAYER-REFRESH":
        this.Librespot(true);
        break;
        
    }
  },

  initialize () {
    if (this.config.debug) logLibrespot = (...args) => { console.log("[LIBRESPOT]", ...args); };
    console.log("[LIBRESPOT] Launch Librespot...");
    this.Librespot();
  },

  /** launch librespot with pm2 **/
  Librespot (restart= false) {
    this.pm2 = pm2;
    var file = "librespot";
    var filePath = null;
    var LibrespotPath = path.resolve(__dirname, "components/librespot", file);
    var LibrespotPathOld = path.resolve(__dirname, "components/librespot/target/release", file);
    var cacheDir = `${__dirname  }/components/librespot/cache`;

    /** back compatibility **/
    if (fs.existsSync(LibrespotPath)) filePath = LibrespotPath;
    else if (fs.existsSync(LibrespotPathOld)) filePath = LibrespotPathOld;

    if (!fs.existsSync(filePath)) {
      console.error("[LIBRESPOT] Librespot is not installed!");
      console.error("[LIBRESPOT] Please run `npm run setup` in EXT-Librespot Folder!");
      this.sendSocketNotification("WARNING" , { message: "LibrespotNoInstalled" });
      return;
    }
    else console.log("[LIBRESPOT] Found Librespot in", filePath);
    this.pm2.connect((err) => {
      if (err) return console.error("[LIBRESPOT]", err);
      this.pm2.list((err,list) => {
        if (err) return console.error("[LIBRESPOT]", err);
        if (list && Object.keys(list).length > 0) {
          for (let [item, info] of Object.entries(list)) {
            if (info.name === "librespot" && info.pid) {
              let deleted = false;
              if (restart) {
                this.pm2.delete("librespot" , (err) => {
                  if (err) console.error("[LIBRESPOT] Librespot Process not found");
                  else {
                    logLibrespot("Librespot Process deleted! (refreshing ident)");
                    deleted= true;
                    this.Librespot(); // recreate process with new ident !
                  }
                });
              }
              if (deleted || restart) return;
              else return console.log("[LIBRESPOT] Librespot already started!");
            }
          }
        }
        this.pm2.start({
          script: filePath,
          name: "librespot",
          out_file: "/dev/null",
          args: [
            "--name",
            this.config.deviceName,
            "--username",
            this.config.email,
            "--password",
            this.config.password,
            "--initial-volume",
            this.config.maxVolume,
            "--cache",
            cacheDir,
            "--cache-size-limit",
            "2G",
            "--volume-ctrl",
            "cubic",
            "--volume-range",
            "40"
          ]
        }, (err, proc) => {
          if (err) {
            this.sendSocketNotification("WARNING" , { message: "LibrespotError", values: err.toString() });
            console.error(`[LIBRESPOT] ${  err}`);
            return;
          }
          console.log("[LIBRESPOT] Librespot started!");
        });
      });
    });
  },

  LibrespotRestart () {
    this.pm2.restart("librespot", (err, proc) => {
      if (err) console.error(`[LIBRESPOT] Error: ${  err}`);
      else console.log("[LIBRESPOT] Restart");
    });
  }
});
