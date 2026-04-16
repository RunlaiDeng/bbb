import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import rpc from "@/components/Rpc";
import Loading from "@/components/Loading";

const PayDeposit = () => {
  const router = useRouter();
  const { id } = router.query;
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchAddress();
    }
  }, [id]);

  const fetchAddress = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await rpc.getAddress(id);
      
      if (result?.error) {
        setError(`Error: ${result.error.message || "Failed to get address"}`);
      } else {
        setAddress(result || "");
      }
    } catch (err) {
      setError(`Error: ${err.message || "Failed to fetch address"}`);
      console.error("Error fetching address:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-base-200/60 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-base-content mb-4">Invalid Request</h1>
          <p className="text-base-content/60">No ID provided</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200/60 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-base-200 rounded-lg shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b border-base-300">
            <h1 className="text-2xl font-bold text-base-content">Payment Deposit</h1>
            <p className="text-sm text-base-content/60 mt-1">ID: {id}</p>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loading />
                <span className="ml-3 text-base-content/60">Loading address...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Address</h3>
                  <p className="text-red-600">{error}</p>
                  <button
                    onClick={fetchAddress}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-base-content/70 mb-2">
                    Deposit Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={address}
                      readOnly
                      className="w-full px-4 py-3 border border-base-300 rounded-lg bg-base-200/60 font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Address will appear here..."
                    />
                    {address && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(address);
                          // You can add a notification here
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-base-content/50 hover:text-base-content/70 focus:outline-none"
                        title="Copy address"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {address && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          Deposit Information
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>Please send your payment to the address above. Make sure to use the correct network and verify the address before sending any funds.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={fetchAddress}
                    className="inline-flex items-center px-4 py-2 border border-base-300 text-sm font-medium rounded-md text-base-content/70 bg-base-200 hover:bg-base-200/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Refresh
                  </button>
                  
                  <button
                    onClick={() => router.back()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayDeposit;
