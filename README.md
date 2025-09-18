# Krunker.io Aimbot, XRay, Spinbot, Wireframe, FOV Box, and 3rd Person  
_By Biggus_Dickus_

A Tampermonkey userscript for **Krunker.io** that enhances gameplay with features like **aimbot, XRay, spinbot, wireframe rendering, FOV box ESP, and third-person perspective**.  

> [!NOTE]
> Gameplay footage

https://github.com/user-attachments/assets/b21ef527-06d8-40d5-9c88-c018f222022f

---

## ✨ Features

- **Aimbot**: Automatically targets the nearest moving player or NPC.  
  - Adjustable smoothing & aim offset for precision.  
- **XRay**: See through walls with customizable opacity and wireframe settings.  
- **Spinbot**: Rotates your character at a configurable speed to confuse opponents.  
- **Wireframe**: Renders players and the world in wireframe mode for visibility.  
- **FOV Box (ESP)**: Displays boxes around players or NPCs.  
- **Third-Person Camera**: Adjustable camera position for third-person view.  

![splash-screen](https://raw.githubusercontent.com/adab00st/krunker_aim_assist/refs/heads/main/assets/aimbot.png)


---

## ⚙️ Installation

### 1. Install Tampermonkey
- Download the extension for your browser:  
  - [Chrome Web Store](https://chrome.google.com/webstore)  
  - [Firefox Add-ons](https://addons.mozilla.org)  
  - [Edge Add-ons](https://microsoftedge.microsoft.com/addons)  
- Follow the browser-specific installation instructions.

### 2. Add the Script
1. Open **Tampermonkey** in your browser.  
2. Click **Create a new script**.  
3. Copy & paste the entire script code into the editor.  
4. Save (`Ctrl+S` or `File > Save`).  
5. Make sure the script is **enabled** in Tampermonkey.  

### 3. Access Krunker.io
- Visit [Krunker.io](https://krunker.io).
- The script will load automatically when you join a game.  

---

## 🎮 Usage

### Open the Menu
- Press **`O`** (the letter "O") to toggle the cheat menu.  
- The menu appears in the center with a blurred background.  
- If it doesn’t appear:  
  - Reload the Krunker.io tab

### Navigating the Menu
- Tabs: **Player**, **Spin**, **ESP**, **Cam**, **Aimbot**.  
- Each tab includes:  
  - **Toggles** → Enable/disable features.  
  - **Sliders/Inputs** → Adjust values (e.g., smoothing, camera offset).  

#### 🔫 Aimbot Tab Extras
- **Reload Script** → Reload the aim assist for a new match.  

---

## 🔧 Feature Configuration

### 🧍 Player
- `wireframe`: Enable wireframe for players.  
- `opacity`: Adjust transparency (0 → invisible, 1 → solid).  
- `charmsColor`: Set player visuals (hex color, e.g., `#FF0000`).  

### 🌀 Spin
- `spinbot`: Enable/disable spinning.  
- `speed`: Control spin speed.  

### 👁️ ESP
- `BoxESP`: Show boxes around players/NPCs.  
- `Charms`: Enable XRay-like visuals.  
- `wireframe`: Apply wireframe to world.  
- `layer` & `opacity`: Adjust depth & transparency.  

### 📷 Camera
- Adjust **x, y, z** values to control third-person view.  
  - Example: `z = -10` pulls the camera back.  

### 🎯 Aimbot
- `krunkAimbot`: Enable/disable aimbot.  
- `smoothingFactor`: Aim smoothness (0 = instant, 1 = smooth).  
- `AimOffset`: Adjust aim height (useful for headshots).  
- `far`: Set max targeting distance.  
- `targetNPCs`: Include/exclude NPCs.  

---

## ▶️ Playing with the Script
1. Join a **public or custom Krunker match**.  
2. Script activates automatically with enabled features.  
3. Use the in-game menu to tweak settings.  

If issues occur:  
- Press **O** again.  
- Use **Reload Script** (Aimbot tab).  
- Check **Console** for errors.  

---

## 🧪 Testing
- Best tested in a **custom game** (`/` menu > Custom > Create).  
- Avoid public matches to prevent bans.  
- Watch the **Console logs** for debug messages like:  
  - `"Scene detected"`  
  - `"Player controller not found"`  

---

## ❗ Troubleshooting

### Menu Not Showing / Blurry Background
- Ensure you’re in a match, not the main menu.  
- Press **O** or use **Reload Script**.  
- Disable other conflicting extensions/scripts.  

### Script Freezes on Match Transition
- The script auto-resets, but if stuck → click **Reload Script**.  
- Check **Console logs** for persistent errors.  

### Aimbot / ESP Not Working
- Verify `krunkAimbot` or `BoxESP` are enabled.  
- Toggle `targetNPCs` if aiming at NPCs.  
- Adjust `smoothingFactor` or `far`.  

### Performance Issues
- Reduce `opacity`.  
- Disable `wireframe`.

---

## 🎉 Enjoy enhanced gameplay
