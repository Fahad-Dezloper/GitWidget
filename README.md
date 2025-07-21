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

We welcome contributions, issues, and feature requests!

### How to contribute

- **Make your changes on a new branch based on `staging`.**  
  Please do **not** use `main` as your base branch. Always branch off from `staging` and open your pull requests against `staging`.

- **Issue naming convention:**  
  When opening issues, please use a prefix to indicate the type, for example:  
  - `fix:[issue title]` for bug fixes  
  - `feat:[feature title]` for new features  
  - `chore:[chore title]` for maintenance tasks

- **Pull Requests:**  
  - Clearly describe your changes and reference any related issues.
  - Make sure your code is linted and tested before submitting.

- **General:**  
  - If you are unsure or want to discuss a feature/bug, feel free to open an issue first.

---

## 📄 License

[MIT](./LICENSE)
