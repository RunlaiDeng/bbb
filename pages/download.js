import Layout from "@/components/Layout";
import { useState } from "react";

export default function Download() {
  const [isDownloading, setIsDownloading] = useState(false);

  const version = "1.0.3";

  const handleAndroidDownload = () => {
    setIsDownloading(true);
    const link = document.createElement("a");
    link.href = "https://benybadboy.b-cdn.net/app/BBBFI-" + version + ".apk";
    link.download = "BBBFI.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsDownloading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Download BBBFI App
          </h1>
          <p className="text-gray-600">
            Mobile app for DeFi trading and portfolio management
          </p>
        </div>

        <div className="space-y-4">
          {/* Android Download */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Android App
                </h3>
                <p className="text-sm text-gray-600">Version {version}</p>
              </div>
              <button
                onClick={handleAndroidDownload}
                disabled={isDownloading}
                className={`px-6 py-2 rounded-lg font-medium ${
                  isDownloading
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isDownloading ? "Downloading..." : "Download"}
              </button>
            </div>
          </div>

          {/* iOS Download */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">iOS App</h3>
                <p className="text-sm text-gray-600">Coming Soon</p>
              </div>
              <button
                disabled
                className="px-6 py-2 rounded-lg font-medium bg-gray-400 text-white cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> You may need to enable &quot;Install from
            unknown sources&quot; to install the APK file.
          </p>
        </div>
      </div>
    </div>
  );
}
