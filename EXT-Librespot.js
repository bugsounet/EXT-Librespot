/**
 ** Module: EXT-Librespot
 ** @bugsounet
 ** ©03-2023
 ** support: https://forum.bugsounet.fr
 **/

Module.register("EXT-Librespot", {
  defaults: {
    debug: false,
    email: null,
    password: null,
    deviceName: "MagicMirror",
    minVolume: 40,
    maxVolume: 100
  },

  start: function () {
    this.ready = false
  },

  getDom: function() {
    var dom = document.createElement("div")
    dom.style.display = 'none'
    return dom
  },

  getTranslations: function() {
    return {
      en: "translations/en.json",
      fr: "translations/fr.json",
      it: "translations/it.json",
      de: "translations/de.json",
      es: "translations/es.json",
      nl: "translations/nl.json",
      pt: "translations/pt.json",
      ko: "translations/ko.json",
      el: "translations/el.json"
    }
  },

  notificationReceived: function(noti, payload, sender) {
    switch(noti) {
      case "GW_READY":
        if (sender.name == "Gateway") {
          this.sendSocketNotification("INIT", this.config)
          this.ready = true
          this.sendNotification("EXT_HELLO", this.name)
        }
        break
      case "EXT_PLAYER-SPOTIFY_RECONNECT":
        if (this.ready) this.sendSocketNotification("PLAYER-RECONNECT")
        break
    }
  },

  socketNotificationReceived: function(noti, payload) {
    if (noti == "WARNING") {
      this.sendNotification("EXT_ALERT", {
        type: "warning",
        message: this.translate(payload.message, {VALUES: payload.values}),
        icon: "modules/EXT-Librespot/resources/Spotify-Logo.png"
      })
    }
  },

  EXT_TELBOTCommands: function(commander) {
    commander.add({
      command: "librespot",
      description: this.translate("TBRestart"),
      callback: "tbLibrespot"
    })
  },

  tbLibrespot: function(command, handler) {
    this.sendSocketNotification("PLAYER-REFRESH")
    handler.reply("TEXT", this.translate("TBRestarted"))
  }
})
