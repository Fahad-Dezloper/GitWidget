# GitWidget

[![GitHub release](https://img.shields.io/github/v/release/Fahad-Dezloper/GitWidget?style=flat-square)](https://github.com/Fahad-Dezloper/GitWidget/releases)
[![CI](https://github.com/Fahad-Dezloper/GitWidget/actions/workflows/release.yml/badge.svg)](https://github.com/Fahad-Dezloper/GitWidget/actions)

A minimal, auto-updating Electron widget for Windows and macOS that displays your GitHub contribution graph and language stats. Built with React, TypeScript, and Electron, GitWidget is designed for seamless desktop integration and quick GitHub insights.

---

## ✨ Features

- **GitHub OAuth** authentication (secure, via deep link and backend exchange)
- **Contribution graph** and top languages bar
- **Auto-update** via GitHub Releases (no manual downloads)
- **Tiny, always-on-top widget** (frameless, resizable)
- **Cross-platform**: Windows & macOS (macOS: experimental)

---

## 🚀 Installation

1. **Clone the repo:**
   ```bash
   git clone https://github.com/Fahad-Dezloper/GitWidget.git
   cd GitWidget
   ```
2. **Install dependencies (use Yarn):**
   ```bash
   yarn
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in any required values (see below).

4. **Run in development:**
   ```bash
   yarn dev
   ```

5. **Build for production:**
   ```bash
   # For Windows
   yarn build:win
   # For macOS (experimental)
   yarn build:mac
   ```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory. See [`example.env`](./example.env) for required variables. Most users do **not** need to set any variables unless customizing the build or using a custom backend.

---

## 🛠 Usage

- **Sign in with GitHub:** Click the button in the widget. A browser window will open for OAuth. On success, the widget will display your stats.
- **Auto-update:** The app checks for updates automatically and notifies you in-app.
- **Logout:** Use the logout button in the widget to disconnect your GitHub account.

---

## 🧩 Related Projects

- **Website (Web version):** [GitWidget-Web](https://github.com/Fahad-Dezloper/GitWidget-Web)
- **Backend Auth Server:** [GitWidget-Auth](https://github.com/Fahad-Dezloper/GitWidget-Auth)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to open an issue or submit a pull request.

---

## 📄 License

[MIT](./LICENSE)
