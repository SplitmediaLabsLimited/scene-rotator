/* globals require, Polymer */

(function()
{
  "use strict";

  var xjs = require('xjs');
  var Scene = xjs.Scene;
  xjs.ready().then(function() {
    function SceneRotator() {}

    SceneRotator.prototype = {
      publish: {
        isRunning   : { value: false, reflect: true }
      },

      ready: function() {
        this.lastIndex = 0;
        this.sceneChangeTimeout = null;
      },

      changeScene: function() {
        var _this = this;
        var sceneArray = _this.$.inputScenes.value.split(",");
        var sceneNumber;
        Scene.getActiveScene().then(function(scene) {
          scene.getSceneNumber().then(function(num) {
            sceneNumber = num;
            var indexOfCurrentScene = sceneArray.indexOf(String(sceneNumber));

            if (indexOfCurrentScene >= 0) {
              if (sceneArray[_this.lastIndex] == String(scene)) {
                //
                var next;
                if (_this.lastIndex < sceneArray.length - 1) {
                  next = _this.lastIndex + 1;
                } else {
                  next = 0;
                }

                Scene.setActiveScene(Number(sceneArray[next]));
                _this.lastIndex = next;
              } else {
                var next;
                if (indexOfCurrentScene < sceneArray.length - 1) {
                  next = indexOfCurrentScene + 1;
                } else {
                  next = 0;
                }
                Scene.setActiveScene(Number(sceneArray[next]));
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
              _this.$.inputScenes.value == "" ||
              _this.$.inputScenes.value == undefined) {
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
      }
    };

    Polymer.call(this, SceneRotator.prototype);
  });
})();
