# Auto-Update Setup Guide

Your GitWidget app now has full auto-update functionality! Here's how it works and how to use it.

## 🚀 What's Been Added

1. **Auto-updater integration** - Checks for updates on startup
2. **GitHub Actions workflow** - Automatically builds and publishes releases
3. **Update notification UI** - Shows users when updates are available
4. **Progress tracking** - Visual feedback during download
5. **Automatic installation** - Updates install and restart the app

## 📦 How It Works

### For Users:
- App automatically checks for updates when it starts
- If an update is available, a notification appears at the top
- Users can download and install updates with one click
- App automatically restarts after installation

### For You (Developer):
- Push code changes to your repository
- Create a new version tag (e.g., `v1.0.1`, `v1.2.0`)
- GitHub Actions automatically builds and releases the app
- All users receive the update automatically

## 🏗️ How to Release Updates

### Step 1: Update Version Number
```bash
# In package.json, bump the version
"version": "1.0.1"  # Change this to your new version
```

### Step 2: Commit Your Changes
```bash
git add .
git commit -m "feat: Add new feature or fix"
git push origin main
```

### Step 3: Create a Release Tag
```bash
# Create and push a version tag
git tag v1.0.1
git push origin v1.0.1
```

### Step 4: Wait for Build
- GitHub Actions will automatically build your app for Windows, Mac, and Linux
- Release files will be published to GitHub Releases
- Users will get notified of the update

## 🔧 Configuration

### Current Settings:
- **Update Check**: On app startup (production only)
- **Auto Install**: 5 seconds after download completes
- **Platforms**: Windows, macOS, Linux
- **Distribution**: GitHub Releases

### Customization Options:

#### Change Update Check Frequency
In `src/main/index.ts`, you can modify when updates are checked:

```typescript
// Check every hour
setInterval(() => {
  autoUpdater.checkForUpdatesAndNotify();
}, 60 * 60 * 1000);

// Check only manually
// Remove autoUpdater.checkForUpdatesAndNotify() from app.whenReady()
```

#### Change Auto-Install Delay
In `src/main/index.ts`, modify the timeout:

```typescript
autoUpdater.on('update-downloaded', (info) => {
  console.log('✅ Update downloaded:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', info);
  }
  // Change from 5 seconds to 30 seconds
  setTimeout(() => {
    autoUpdater.quitAndInstall();
  }, 30000);
});
```

## 🧪 Testing Updates

### Test in Development:
```bash
# Build a test version
npm run build:win

# Install it, then create a new version and test the update
```

### Test with Staging Releases:
1. Create pre-release tags: `v1.0.1-beta`
2. Test with a small group before public release
3. Use `draft: true` in GitHub Actions for testing

## 📋 Version Tag Examples

- `v1.0.0` - Major release
- `v1.0.1` - Bug fix
- `v1.1.0` - New features
- `v2.0.0` - Breaking changes
- `v1.0.1-beta` - Pre-release

## 🐛 Troubleshooting

### Update Not Showing:
- Check if version in package.json matches the tag
- Verify GitHub Actions completed successfully
- Check GitHub Releases for published files

### Build Failures:
- Check GitHub Actions logs
- Ensure all dependencies are in package.json
- Verify GitHub token permissions

### Manual Update Check:
Users can manually trigger update checks through the update notification component.

## 🔐 Security Notes

- Updates are signed with GitHub's certificate
- Only downloads from your GitHub repository
- Users see the version and can verify updates
- No auto-update in development mode

## 📝 What Happens Next

1. **Push changes**: Make your changes and push to GitHub
2. **Tag version**: Create a version tag like `v1.0.1`
3. **Auto-build**: GitHub Actions builds for all platforms
4. **Auto-distribute**: Releases published to GitHub
5. **Auto-notify**: Users get update notifications
6. **Auto-install**: Updates install automatically

Your app now has enterprise-grade auto-update functionality! 🎉 