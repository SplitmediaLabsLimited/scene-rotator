/* globals require, Polymer */

(function()
{
  "use strict";

  var xjs = require('xjs');
  var Scene = xjs.Scene;
  var App = new xjs.App();

  // We use this to workaround error in the app method `getVersion` due to change in XBC CEF userAgent
  var getVersion = function() {
    let xbcPattern = /(?:XSplit Broadcaster\s|XSplit\sBroadcaster\sPTR\s|XSplitBroadcaster\/|XSplitBroadcasterPTR\/)(.*?)\s/;
    let xbcMatch = navigator.appVersion.match(xbcPattern);

    if (xbcMatch !== null) {
      return xbcMatch[1];
    } else {
      throw new Error('not loaded in XSplit Broadcaster');
    }
  }

  xjs.ready().then(function() {
    function SceneRotator() {}

    SceneRotator.prototype = {
      publish: {
        isRunning   : { value: false, reflect: true }
      },

      ready: function() {
        this.lastIndex = 0;
        this.sceneChangeTimeout = null;
        this.populateScenes();
        xjs.ExtensionWindow.getInstance().resize(390, 450);
      },

      changeScene: function() {
        var _this = this;


        var version = getVersion();
        var versionArray = version.split('.');
        var versionNumber = Number(versionArray[0] + '.' + versionArray[1]);

        if (versionNumber > 2.7) {
          _this.populateScenes();
        }

        //var sceneArray = _this.$.inputScenes.value.split(",");
        var sceneArray = _this.$.sceneList.optionlist.map(function(obj) {
          return obj.id;
        });
        var sceneNumber;
        Scene.getActiveScene().then(function(scene) {
          scene.getSceneIndex().then(function(num) {
            sceneNumber = num;
            var indexOfCurrentScene = sceneArray.indexOf(sceneNumber);

            if (indexOfCurrentScene >= 0) {
              if (sceneArray[_this.lastIndex] == scene) {
                //
                var next;
                if (_this.lastIndex < sceneArray.length - 1) {
                  next = _this.lastIndex + 1;
                } else {
                  next = 0;
                }
                console.log('Switch to::',sceneArray[next])
                Scene.setActiveScene(Number(sceneArray[next]+1));
                _this.lastIndex = next;
              } else {
                var next;
                if (indexOfCurrentScene < sceneArray.length - 1) {
                  next = indexOfCurrentScene + 1;
                } else {
                  next = 0;
                }

                Scene.setActiveScene(Number(sceneArray[next] + 1));
                _this.lastIndex = next;
              }
            } else {
              _this.lastIndex = 0;
              Scene.setActiveScene(Number(sceneArray[0]));
            }
            _this.sceneChangeTimeout = setTimeout(_this.changeScene.bind(_this),
              parseInt(_this.$.rotationInterval.value) * 1000);
          });
        });
      },

      // When button is toggled
      toggleSwitcher: function(event) {
        var _this = this,
        btn = event.target;
        if (this.isRunning) {
          clearTimeout(_this.sceneChangeTimeout);
          btn.classList.remove("active");
          this.$.indicator.classList.remove("active");
          this.$.indicator.innerHTML = "INACTIVE";
        } else {
          if (_this.$.rotationInterval.value == "" ||
              _this.$.sceneList.optionlist.length === 0) {
            return;
          }

          _this.sceneChangeTimeout = setTimeout(_this.changeScene.bind(_this),
            parseInt(_this.$.rotationInterval.value) * 1000);
          btn.classList.add("active");
          this.$.indicator.classList.add("active");
          this.$.indicator.innerHTML = "ACTIVE";
        }

        btn.classList.add("selected");
        btn.textContent = (this.isRunning ? "Start" : "Stop") +
        " Script";
        this.isRunning = !this.isRunning;
      },

      populateScenes: function() {
        var dropdown = this.$.sceneSelect;
        dropdown.innerHTML = '';

        Scene.initializeScenes();
        let countArr = []
        Scene.getSceneCount().then(count => {
          for(var i = 0; i < count ; i++){
            countArr.push(i)
          }
          let promises = countArr.map(cnt => {
            return new Promise(resolve => {
              Scene.getBySceneIndex(cnt).then(scene => {
                return scene.getName()
              }).then(name => {
                var option = document.createElement('xui-option');
                option.value = cnt;
                option.textContent = name;
                resolve(option)
              })
            })
          })

          Promise.all(promises).then(options => {
            for (var option in options) {
              dropdown.appendChild(options[option]);
              dropdown.value = "0";
            }
          })
        })
      },

      addScene: function() {
        var selectedScene = {
          id: this.$.sceneSelect.selected.value,
          name: this.$.sceneSelect.selected.textContent
        };

        this.$.sceneList.optionlist.push(selectedScene);
      }
    };

    Polymer.call(this, SceneRotator.prototype);
  });
})();
