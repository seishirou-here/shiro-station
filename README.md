<div align="center">

```
   ╔═══════════════════════════════════════════════════════════════╗
   ║  🌸  SR 01  │  シロ駅  ·  SHIRO STATION  │  NOZOMI N700S  🚅  ║
   ╚═══════════════════════════════════════════════════════════════╝
```

# 🌸 SHIRO STATION `シロ駅`

**A cozy golden-hour 3D Shinkansen portfolio — crafted with sakura petals, vinyl lo-fi, and anime railway magic.**  
*(｡•̀ᴗ-)✧ step onto Platform 1, board the N700S, and explore every car!*

[![Built with React Three Fiber](https://img.shields.io/badge/React_Three_Fiber-3D_World-7bae7f?style=for-the-badge&logo=threedotjs&logoColor=white)](https://r3f.docs.pmnd.rs/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-ffb347?style=for-the-badge&logo=typescript&logoColor=2b211c)](https://www.typescriptlang.org/)
[![Blender 3D](https://img.shields.io/badge/Blender-Custom_GLB-ff9cbd?style=for-the-badge&logo=blender&logoColor=2b211c)](https://www.blender.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-5c4033?style=for-the-badge)](./LICENSE)

---

*“ご乗車ありがとうございます — Welcome aboard Shiro’s little corner of the internet.”* 🍵📀

</div>

## ✨ What's Waiting at Platform 1?

Instead of a plain navbar, **Shiro Station** is a tiny playable 3D anime diorama where every landmark is clickable *(hover to glow → 1st click to focus → 2nd click to open)*:

| Location | Landmark | What's Inside |
| :--- | :--- | :--- |
| 🚉 **Platform 1** | **Hanging JR Signboard** `シロ駅` | Live real-time digital clock & boarding status |
| 🥤 **Platform 1** | **Vending Machine** `自販機` | Pick a flavored drink can to read short **Devlogs & Blogs** |
| 📌 **Platform 1** | **Station Corkboard** `掲示板` | Pin a colorful sticky note on the **Visitor Guestbook** |
| 🗻 **Horizon** | **3D Mount Fuji & Sakura Grove** `桜` | Volumetric anime clouds, golden sunset & drifting cherry petals |
| 🚅 **Car 01** | **N700S Front Nose** | Modern Dual Supreme Wing aerodynamic nose *(clean cockpit)* |
| 💺 **Car 02** | **Clickable Shinkansen Seats** `プロジェクト` | 4 cozy seats with glowing tablets — each seat hosts a **Project** |
| 📀 **Car 03** | **Vintage Vinyl Turntable Lounge** `サウンド` | Spinning vinyl record, matcha cup, warm lamp & **Web Audio Lo-Fi** |
| 🪟 **Car 04** | **Mt. Fuji Corridor** | Panoramic sunset window seats overlooking Mount Fuji |
| 🎟️ **Car 05** | **Rear Observation Finale** `プロフィール` | **About Shiro**, current status, toolkit & anime-ending **Credits** |

---

## 🎮 Controls & Little Touches

- **Click Directly on 3D Objects** — no cluttered floating button bars; objects softly glow when hovered.
- **2-Step Focus UX** — `Click 1` zooms in to admire the prop, `Click 2` opens its content (`Esc` or `← Back` to step back).
- **360° Inside-Car Exploration** — click & drag (or swipe on mobile) inside any train car to look around every cozy corner.
- **Keyboard Friendly** — use `A` / `D` or `←` / `→` to walk through cars, and `Esc` to step back.
- **Zero-Weight Audio** — synthesized JR station chimes & cozy lo-fi chord loops built straight with Web Audio API (`0 KB` audio files!).

---

## 🛠️ Tech & Craft

- **Frontend:** React 19 + TypeScript + Vite 6 + Tailwind CSS 4 + Zustand
- **3D Engine:** Three.js + React Three Fiber (`@react-three/fiber` & `@react-three/drei`)
- **Custom 3D Models:** Modeled & exported in Blender (`shinkansen.glb`, `station_platform.glb`, `mount_fuji.glb`, and 3 varied-height `sakura_tree_*.glb`)
- **Performance:** Lightweight procedural textures, instanced drifting sakura petals, ACES Filmic tone mapping, and adaptive DPR/shadow quality for smooth desktop & mobile runs.

---

## 🚀 Run Locally

```bash
# 1. Clone the station
git clone https://github.com/Only-shiro-here/shinkansen-portfolio.git
cd shinkansen-portfolio

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Want to customize the bio, projects, devlogs, or vinyl tracklist? Everything lives neatly in [`src/data/portfolioData.ts`](./src/data/portfolioData.ts) ✨

---

<div align="center">

Made with warm sunset light, sakura petals, and way too much attention to bullet train noses by **[@Only-shiro-here](https://github.com/Only-shiro-here)** 🚅🌸  
*Licensed under the [MIT License](./LICENSE) — feel free to explore & get inspired!* (っ´ω`c)♡

</div>
