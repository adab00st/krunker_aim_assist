// ==UserScript==
// @name         KRUNKER.IO AIMBOT, XRAY, SPINBOT, WIREFRAME, FOV BOX, AND 3RD PERSON BY BIGGUS_DICKUS
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Krunker's Mod Menu Aimbot targets nearest moving player. Adjust Smoothing for precision. Use Xray to see through walls, wireframe for players & world, and more
// @author       BIGGUS_DICKUS
// @match        *://krunker.io/*
// @match        *://browserfps.com/*
// @exclude      *://krunker.io/social*
// @exclude      *://krunker.io/editor*
// @icon         https://raw.githubusercontent.com/adab00st/krunker_aim_assist/refs/heads/main/assets/icon.jpg
// @grant        none
// @require      https://unpkg.com/three@0.150.0/build/three.min.js
// ==/UserScript==

const THREE = window.THREE;

let WorldScene;
let intersections;
let BIGGUS_DICKUS = {
  player: {
    wireframe: true,
    opacity: 1,
    charmsColor: "#000000",
  },
  spin: {
    spinbot: false,
    speed: 0.1,
    spinAngle: 0,
  },
  ESP: {
    BoxESP: true,
    Charms: true,
    wireframe: false,
    layer: 2,
    opacity: 0.3,
  },
  Cam: {
    x: 0,
    y: 0,
    z: 0,
  },
  aimbot: {
    krunkAimbot: true,
    smoothingFactor: 0.6,
    AimOffset: 0.6,
    far: 100000
  },
};
let norms = {
  allowTarget: true,
  console: console.log,
  injectTime: 2000,
};
const originalArrayPush = Array.prototype.push;
const getMainScene = function (object) {
  if (
    object &&
    object.parent &&
    object.parent.type === "Scene" &&
    object.parent.name === "Main"
  ) {
    WorldScene = object.parent;
    norms.console("Scene detected: ", WorldScene);
    Array.prototype.push = originalArrayPush;
  }
  return originalArrayPush.apply(this, arguments);
};

const ESPMatrix = new THREE.EdgesGeometry(
  new THREE.BoxGeometry(5, 13, 0.02).translate(0, 5, 0),
);

const ESPMaterial = new THREE.RawShaderMaterial({
  vertexShader: `
        attribute vec3 position;
        uniform mat4 projectionMatrix;
        uniform mat4 modelViewMatrix;
        void main() {
            vec4 pos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            pos.z = 0.9999;
            gl_Position = pos;
        }
    `,
  fragmentShader: `
        void main() {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
    `,
  depthTest: false,
  depthWrite: false,
  transparent: true,
});

let injectTimer = null;

function HBO() {
  requestAnimationFrame.call(window, HBO);
  if (!WorldScene && !injectTimer) {
    const loadingEl = document.querySelector('#loadingBg');
    if (loadingEl && loadingEl.style.display === 'none') {
      norms.console("Game loaded, injecting proxy...");
      injectTimer = setTimeout(() => {
        Array.prototype.push = getMainScene;
        injectTimer = null;
      }, norms.injectTime);
    }
    return;
  }
  const entities = [];
  let myController;
  let PlayerTarget;
  let RangeFactor = Infinity;

  WorldScene.children.forEach((child) => {
    if (child.material && child.material.wireframe !== undefined)
      child.material.wireframe = BIGGUS_DICKUS.ESP.wireframe;
    if (child.type === "Object3D") {
      try {
        const Camera = child.children[0]?.children[0];
        if (Camera && Camera.type === "PerspectiveCamera") {
          myController = child;
        } else {
          entities.push(child);
        }
      } catch {}
    }
  });
  if (!myController) {
    norms.console("Player controller not found - likely new match. Resetting scene detection.");
    WorldScene = null;
    Array.prototype.push = getMainScene;
    reloadScript();
    return;
  }
  function DoSpin() {
    BIGGUS_DICKUS.spin.spinAngle += BIGGUS_DICKUS.spin.speed;
    const targetRotationY = BIGGUS_DICKUS.spin.spinAngle % (Math.PI * 2);
    myController.children[0].rotation.y +=
      (targetRotationY - myController.children[0].rotation.y) *
      BIGGUS_DICKUS.aimbot.smoothingFactor;
  }
  entities.forEach((player) => {
    try {
      let targetPosition = player.position;
      const hasHead =
        player.children[0]?.children[4]?.children[0]?.name === "head";
      let isMoving = false;

      if (player.userData && player.userData.lastPosition) {
        const lastPos = player.userData.lastPosition;
        const currentPos = player.position;
        isMoving =
          Math.abs(currentPos.x - lastPos.x) > 0.01 ||
          Math.abs(currentPos.y - lastPos.y) > 0.01 ||
          Math.abs(currentPos.z - lastPos.z) > 0.01;
      }
      player.userData = player.userData || {};
      player.userData.lastPosition = player.position.clone();

      if (hasHead) {
        const charmsColor = new THREE.Color(BIGGUS_DICKUS.player.charmsColor);
        const material = player.children[0].children[0].material;
        material.transparent = true;
        material.fog = false;
        material.color.copy(charmsColor);
        material.emissive.copy(charmsColor);
        material.depthTest = BIGGUS_DICKUS.ESP.Charms ? false : true;
        material.depthWrite = false;
        material.wireframe = BIGGUS_DICKUS.player.wireframe;
        material.opacity = BIGGUS_DICKUS.player.opacity;
        targetPosition = player.children[0].children[4].children[0].position;
        if (!player.vertex) {
          const vertex = new THREE.LineSegments(ESPMatrix, ESPMaterial);
          player.add(vertex);
          vertex.frustumCulled = false;
          player.vertex = vertex;
        }
        player.vertex.visible = BIGGUS_DICKUS.ESP.BoxESP;
      }

      const { x: playerX, z: playerZ } = player.position;
      const { x: controllerX, z: controllerZ } = myController.position;

      if (
        (playerX !== controllerX || playerZ !== controllerZ) &&
        (isMoving || hasHead)
      ) {
        const dist = player.position.distanceTo(myController.position);
        if (dist < RangeFactor && dist < BIGGUS_DICKUS.aimbot.far) {
          PlayerTarget = player;
          RangeFactor = dist;
        }
      }
    } catch (e) {
      console.error("Error processing entity:", e);
    }
  });
  if (BIGGUS_DICKUS.spin.spinbot) DoSpin();
  const Vector = new THREE.Vector3();
  const HoldObject = new THREE.Object3D();
  HoldObject.rotation.order = "YXZ";
  HoldObject.matrix.copy(myController.matrix).invert();
  myController.children[0].position.set(
    BIGGUS_DICKUS.Cam.x,
    BIGGUS_DICKUS.Cam.y,
    BIGGUS_DICKUS.Cam.z,
  );
  if (myController && PlayerTarget && BIGGUS_DICKUS.aimbot.krunkAimbot) {
    try {
      const dist = PlayerTarget.position.distanceTo(myController.position);
      Vector.setScalar(0);
      const hasHead =
        PlayerTarget.children[0]?.children[4]?.children[0]?.name === "head";
      if (hasHead) {
        PlayerTarget.children[0].children[4].children[0].localToWorld(Vector);
      } else {
        Vector.copy(PlayerTarget.position);
      }
      HoldObject.position.copy(myController.position);
      HoldObject.lookAt(Vector.x, Vector.y, Vector.z);

      const targetRotationX =
        -HoldObject.rotation.x + (BIGGUS_DICKUS.aimbot.AimOffset / dist) * 5;
      const targetRotationY = HoldObject.rotation.y + Math.PI;
      myController.children[0].rotation.x +=
        (targetRotationX - myController.children[0].rotation.x) *
        BIGGUS_DICKUS.aimbot.smoothingFactor;
      myController.rotation.y +=
        (targetRotationY - myController.rotation.y) *
        BIGGUS_DICKUS.aimbot.smoothingFactor;
    } catch (e) {
      console.error("Error in aimbot logic:", e);
    }
  }
}
function createMenuItem() {
  const styleTag = document.createElement("style");
  styleTag.textContent = `
        .bd-menuItem:hover img {
          transform: scale(1.1);
        }
      `;
  document.head.appendChild(styleTag);
  const menuItemDiv = document.createElement("div");
  menuItemDiv.classList.add("menuItem", "bd-menuItem");
  menuItemDiv.setAttribute("onmouseenter", "playTick()");
  menuItemDiv.setAttribute("onclick", "playSelect()");
  const iconSpan = document.createElement("span");
  iconSpan.innerHTML = `<img src="https://raw.githubusercontent.com/adab00st/krunker_aim_assist/refs/heads/main/assets/icon.jpg" width='60' height='60'>`;
  iconSpan.style.color = "#ff6a0b";
  const titleDiv = document.createElement("div");
  titleDiv.classList.add("bd-menuItemTitle", "menuItemTitle");
  titleDiv.id = "menuBtnProfile";
  titleDiv.style.fontSize = "18px";
  titleDiv.textContent = "CH3ATS";
  menuItemDiv.addEventListener("click", openCheats);
  menuItemDiv.appendChild(iconSpan);
  menuItemDiv.appendChild(titleDiv);
  const menuItemContainer = document.getElementById("menuItemContainer");
  if (menuItemContainer) {
    menuItemContainer.appendChild(menuItemDiv);
  } else {
    console.log("Warning: #menuItemContainer not found.");
  }
}
function reloadScript() {
  WorldScene = null;
  intersections = null;
  BIGGUS_DICKUS.spin.spinAngle = 0;
  Array.prototype.push = getMainScene;
  const existingMenu = document.getElementById("bd-menuContainer");
  if (existingMenu) existingMenu.remove();
  const newMenuContainer = document.createElement("div");
  newMenuContainer.id = "bd-menuContainer";
  newMenuContainer.style.display = "none";
  document.body.appendChild(newMenuContainer);
  const newHeader = document.createElement("div");
  newHeader.innerHTML = `
       <div class="bd-header">
        <section class="bd-inlineNames">
        <img width="48" height="48" src="https://raw.githubusercontent.com/adab00st/krunker_aim_assist/refs/heads/main/assets/icon.jpg">
        <p class='bd-menuHeaderText'>Biggus Dickus</p>
        </section>
          <div class="bd-bg"></div>
        </div>
    `;
  newMenuContainer.appendChild(newHeader);
  tabLinks.innerHTML = "";
  tabContents = {};
  tabNames.forEach((tabName) => createTab(tabName));
  console.log("Script reloaded");
}

setTimeout(function () {
  createMenuItem();
}, 700);

const style = document.createElement("style");
style.innerHTML = `
/* Scoped styles for mod menu */
#bd-menuContainer {
    background-color: #121212;
    margin: 0;
    padding: 24px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    z-index: 1000;
    width: 400px;
    max-height: 80vh;
    overflow-y: auto;
    transition: opacity 0.3s ease, transform 0.3s ease;
}

#bd-menuContainer.hidden {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
    pointer-events: none;
}

#bd-menuContainer .bd-menuHeaderText {
    font-size: 24px;
    font-weight: 600;
    text-align: left;
    margin: 0;
    color: #e0e0e0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

#bd-menuContainer .bd-tab {
    display: flex;
    justify-content: flex-start;
    gap: 16px;
    margin-bottom: 24px;
    border-bottom: 1px solid #333;
    padding-bottom: 8px;
}

#bd-menuContainer .bd-tab button {
    background-color: transparent;
    border: none;
    padding: 8px 0;
    font-size: 14px;
    font-weight: 500;
    outline: none;
    color: #a0a0a0;
    cursor: pointer;
    transition: color 0.2s ease;
    position: relative;
}

#bd-menuContainer .bd-tab button:hover,
#bd-menuContainer .bd-tab button.active {
    color: #ffffff;
}

#bd-menuContainer .bd-tab button.active::after {
    content: '';
    position: absolute;
    bottom: -9px;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(to right, #5a64c8, #c85a64);
}

#bd-menuContainer .bd-tabcontent {
    display: none;
}

#bd-menuContainer .bd-tabcontent.active {
    display: block;
}

#bd-menuContainer .bd-option-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

#bd-menuContainer .bd-label-inline {
    font-size: 14px;
    font-weight: 500;
    color: #e0e0e0;
    margin: 0;
}

#bd-menuContainer .bd-switch {
    position: relative;
    display: inline-block;
    width: 48px;
    height: 24px;
}

#bd-menuContainer .bd-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

#bd-menuContainer .bd-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #333;
    transition: 0.3s;
    border-radius: 24px;
}

#bd-menuContainer .bd-slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 2px;
    bottom: 2px;
    background-color: #fff;
    transition: 0.3s;
    border-radius: 50%;
}

#bd-menuContainer input:checked + .bd-slider {
    background: linear-gradient(to right, #5a64c8, #c85a64);
}

#bd-menuContainer input:checked + .bd-slider:before {
    transform: translateX(24px);
}

#bd-menuContainer input[type="number"],
#bd-menuContainer input[type="text"] {
    width: 80px;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #333;
    background-color: #1f1f1f;
    color: #e0e0e0;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
}

#bd-menuContainer input[type="number"]:focus,
#bd-menuContainer input[type="text"]:focus {
    border-color: #5a64c8;
}

#bd-menuContainer input[type="color"] {
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    cursor: pointer;
    padding: 0;
}

#bd-menuContainer input[type="color"]::-webkit-color-swatch {
    border: 1px solid #333;
    border-radius: 4px;
}

#bd-menuContainer .bd-button {
    background: linear-gradient(to right, #5a64c8, #c85a64);
    border: none;
    color: #fff;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: opacity 0.2s;
}

#bd-menuContainer .bd-button:hover {
    opacity: 0.9;
}

.bd-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    z-index: 999;
    display: none;
    transition: opacity 0.3s ease;
}

.bd-overlay.show {
    display: block;
    opacity: 1;
}

#bd-menuContainer .bd-bg {
    background: linear-gradient(to right, #5a64c8, #c85a64);
    border-radius: 3px;
    height: 4px;
    margin-top: 8px;
}

#bd-menuContainer .bd-inlineNames {
    display: flex;
    align-items: center;
    gap: 12px;
}

#bd-menuContainer .bd-inlineNames img {
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

#bd-menuContainer .bd-close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    color: #a0a0a0;
    font-size: 24px;
    cursor: pointer;
    transition: color 0.2s;
}

#bd-menuContainer .bd-close-btn:hover {
    color: #e0e0e0;
}
`;
document.head.appendChild(style);

const overlay = document.createElement("div");
overlay.classList.add("bd-overlay");
document.body.appendChild(overlay);

let tabLinks = document.createElement("div");
tabLinks.classList.add("bd-tab");
let tabContents = {};
const tabNames = Object.keys(BIGGUS_DICKUS);
let firstOpen = false;

function createTab(tabName) {
  const tabButton = document.createElement("button");
  tabButton.textContent = tabName.charAt(0).toUpperCase() + tabName.slice(1);
  tabButton.addEventListener("click", () => openTab(tabName));
  tabLinks.appendChild(tabButton);

  const tabContent = document.createElement("div");
  tabContent.classList.add("bd-tabcontent");
  menuContainer.appendChild(tabContent);
  tabContents[tabName] = tabContent;

  populateTab(tabName);
}

function populateTab(tabName) {
  const tabContent = tabContents[tabName];
  const tabOptions = BIGGUS_DICKUS[tabName];
  for (const option in tabOptions) {
    if (typeof tabOptions[option] !== "object") {
      const row = document.createElement("div");
      row.classList.add("bd-option-row");

      const label = document.createElement("label");
      label.textContent = option.charAt(0).toUpperCase() + option.slice(1).replace(/([A-Z])/g, ' $1').trim();
      label.classList.add("bd-label-inline");
      row.appendChild(label);

      if (typeof tabOptions[option] === "boolean") {
        const switchLabel = document.createElement("label");
        switchLabel.classList.add("bd-switch");
        const switchInput = document.createElement("input");
        switchInput.type = "checkbox";
        switchInput.checked = tabOptions[option];
        switchInput.addEventListener("change", (event) => {
          tabOptions[option] = event.target.checked;
          BIGGUS_DICKUS[tabName][option] = tabOptions[option];
        });
        const sliderSpan = document.createElement("span");
        sliderSpan.classList.add("bd-slider");
        switchLabel.appendChild(switchInput);
        switchLabel.appendChild(sliderSpan);
        row.appendChild(switchLabel);
      } else if (typeof tabOptions[option] === "number") {
        const inputField = document.createElement("input");
        inputField.type = "number";
        inputField.step = "0.01";
        inputField.value = tabOptions[option];
        inputField.addEventListener("input", (event) => {
          const value = parseFloat(event.target.value) || 0;
          tabOptions[option] = value;
          BIGGUS_DICKUS[tabName][option] = value;
        });
        row.appendChild(inputField);
      } else if (option.toLowerCase().includes("color")) {
        const colorInput = document.createElement("input");
        colorInput.type = "color";
        colorInput.value = tabOptions[option];
        colorInput.addEventListener("input", (event) => {
          tabOptions[option] = event.target.value;
          BIGGUS_DICKUS[tabName][option] = tabOptions[option];
        });
        row.appendChild(colorInput);
      } else {
        const inputField = document.createElement("input");
        inputField.type = "text";
        inputField.value = tabOptions[option];
        inputField.addEventListener("input", (event) => {
          tabOptions[option] = event.target.value;
          BIGGUS_DICKUS[tabName][option] = tabOptions[option];
        });
        row.appendChild(inputField);
      }
      tabContent.appendChild(row);
    }
  }
  if (tabName === "aimbot") {
    const row = document.createElement("div");
    row.classList.add("bd-option-row");
    const reloadLabel = document.createElement("label");
    reloadLabel.textContent = "Reload Script";
    reloadLabel.classList.add("bd-label-inline");
    row.appendChild(reloadLabel);

    const reloadButton = document.createElement("button");
    reloadButton.classList.add("bd-button");
    reloadButton.textContent = "Reload";
    reloadButton.addEventListener("click", reloadScript);
    row.appendChild(reloadButton);
    tabContent.appendChild(row);
  }
}

function openTab(tabName) {
  const tabs = document.querySelectorAll(".bd-tabcontent");
  tabs.forEach((tab) => tab.classList.remove("active"));
  const tabButtons = document.querySelectorAll(".bd-tab button");
  tabButtons.forEach((tabButton) => tabButton.classList.remove("active"));
  const tabContent = tabContents[tabName];
  tabContent.classList.add("active");
  const tabButton = [...tabLinks.querySelectorAll("button")].find(
    (button) =>
      button.textContent === tabName.charAt(0).toUpperCase() + tabName.slice(1),
  );
  if (tabButton) tabButton.classList.add("active");
}

const menuContainer = document.createElement("div");
menuContainer.id = "bd-menuContainer";
menuContainer.style.display = "none";
document.body.appendChild(menuContainer);
const header = document.createElement("div");
header.innerHTML = `
   <div class="bd-header">
    <section class="bd-inlineNames">
    <img width="48" height="48" src="https://raw.githubusercontent.com/adab00st/krunker_aim_assist/refs/heads/main/assets/icon.jpg">
    <p class='bd-menuHeaderText'>Biggus Dickus</p>
    </section>
      <div class="bd-bg"></div>
    </div>
`;
menuContainer.appendChild(header);

const closeBtn = document.createElement("button");
closeBtn.classList.add("bd-close-btn");
closeBtn.innerHTML = "&times;";
closeBtn.addEventListener("click", openCheats);
menuContainer.appendChild(closeBtn);

menuContainer.appendChild(tabLinks);
tabNames.forEach((tabName) => createTab(tabName));

function openCheats() {
  const isHidden = menuContainer.style.display === "none";
  if (isHidden) {
    menuContainer.style.display = "block";
    menuContainer.classList.remove("hidden");
    overlay.classList.add("show");
    if (!firstOpen) {
      openTab(tabNames[0]);
      firstOpen = true;
    }
  } else {
    menuContainer.classList.add("hidden");
    overlay.classList.remove("show");
    setTimeout(() => {
      menuContainer.style.display = "none";
    }, 300);
  }
}

document.addEventListener("keydown", function (event) {
  if (event.keyCode === 79) {
    openCheats();
  }
});

HBO();