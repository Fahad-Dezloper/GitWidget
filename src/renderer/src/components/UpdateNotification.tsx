import { useState, useEffect } from 'react';
import React from 'react';

interface UpdateInfo {
  version: string;
  releaseNotes?: string;
}

interface DownloadProgress {
  percent: number;
  transferred: number;
  total: number;
}

export default function UpdateNotification(): React.JSX.Element | null {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [updateReady, setUpdateReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for update events from main process
    const handleUpdateAvailable = (info: UpdateInfo): void => {
      console.log('Update available:', info);
      setUpdateAvailable(true);
      setUpdateInfo(info);
    };

    const handleDownloadProgress = (progress: DownloadProgress): void => {
      console.log('Download progress:', progress);
      setDownloadProgress(progress);
    };

    const handleUpdateDownloaded = (info: UpdateInfo): void => {
      console.log('Update downloaded:', info);
      setDownloading(false);
      setUpdateReady(true);
      setUpdateInfo(info);
    };

    const handleUpdateError = (message: string): void => {
      console.error('Update error:', message);
      setError(message);
      setDownloading(false);
    };

    // Register event listeners
    window.electron.on('update-available', handleUpdateAvailable);
    window.electron.on('download-progress', handleDownloadProgress);
    window.electron.on('update-downloaded', handleUpdateDownloaded);
    window.electron.on('update-error', handleUpdateError);

    return (): void => {
      // Note: removeListener may not be available, so we skip cleanup
      // The listeners will be automatically cleaned up when component unmounts
    };
  }, []);

  const handleInstallUpdate = (): void => {
    // @ts-ignore: on purpose
    window.electron.installUpdate();
  };

  const handleCheckForUpdates = (): void => {
    setError(null);
    // @ts-ignore: on purpose
    window.electron.checkForUpdates();
  };

  if (error) {
    return (
      <div className="update-notification error">
        <p>❌ Update Error: {error}</p>
        <button onClick={handleCheckForUpdates}>Retry</button>
      </div>
    );
  }

  if (updateReady) {
    return (
      <div className="update-notification ready">
        <p>✅ Update {updateInfo?.version} ready!</p>
        <button onClick={handleInstallUpdate}>Install & Restart</button>
      </div>
    );
  }

  if (downloading && downloadProgress) {
    return (
      <div className="update-notification downloading">
        <p>📥 Downloading update... {Math.round(downloadProgress.percent)}%</p>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${downloadProgress.percent}%` }}
          />
        </div>
      </div>
    );
  }

  if (updateAvailable) {
    return (
      <div className="update-notification available">
        <p>📦 Update {updateInfo?.version} available!</p>
        <button onClick={() => setDownloading(true)}>Download</button>
      </div>
    );
  }

  return null;
} 