import Head from 'next/head';

const BrandAssets = () => {
  const assets = [
    {
      name: 'BBB Favicon',
      description: 'Official BBB favicon for browser tab icons',
      path: '/logosm.png',
      fileName: 'logosm.png',
    },
    {
      name: 'BBB Pump Card',
      description: 'Official BBB pump card image',
      path: '/bbbpump-card.png',
      fileName: 'bbbpump-card.png',
    },
    {
      name: 'BBB Logo',
      description: 'Official BBB logo image',
      path: '/logo.png',
      fileName: 'logo.png',
    },
  ];

  const handleDownload = (path, fileName) => {
    const link = document.createElement('a');
    link.href = path;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Head>
        <title>BBB Brand Assets</title>
      </Head>
      
      <div className="container mx-auto px-4 py-16 min-h-screen bg-gradient-to-b from-green-50 to-green-100">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 text-green-800">Brand Assets</h1>
          <p className="text-green-600">
            Download official BBB brand assets and logos
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {assets.map((asset) => (
            <div key={asset.name} className="card bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <figure className="px-6 pt-6">
                <img
                  src={asset.path}
                  alt={asset.name}
                  className="h-48 w-full object-contain bg-green-50 rounded-xl p-4"
                />
              </figure>
              <div className="card-body">
                <h2 className="card-title text-green-700">{asset.name}</h2>
                <p className="text-green-600/80">{asset.description}</p>
                <div className="card-actions justify-end mt-4">
                  <button
                    className="btn bg-green-600 hover:bg-green-700 text-white border-none w-full"
                    onClick={() => handleDownload(asset.path, asset.fileName)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default BrandAssets;
