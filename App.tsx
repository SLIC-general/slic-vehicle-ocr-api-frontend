import React, { useState } from 'react';
import Uploader from './components/Uploader';
import ResultDisplay from './components/ResultDisplay';
import { VehicleCRData, OverallQuality, AnalyzeResponse } from './types';
import { analyzeCrDocument } from './services/apiClient';

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<VehicleCRData | null>(null);
  const [fullResponse, setFullResponse] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'json'>('cards');
  const [copyStatus, setCopyStatus] = useState<string>('Copy JSON');

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setError(null); // Clear old errors
    setLoading(true);
    setExtractedData(null);
    setFullResponse(null);
    setViewMode('cards');

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }

    try {
      const result = await analyzeCrDocument(file);
      setFullResponse(result);
      setExtractedData(result.data.fields);
    } catch (err: any) {
      console.error(err);
      // err.message contains our friendly message from apiClient.ts!
      const fallbackMsg = err.message || 'An unexpected error occurred. Please try again.';
      setError(fallbackMsg);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setExtractedData(null);
    setFullResponse(null);
    setError(null);
    setPreviewUrl(null);
    setSelectedFile(null);
    setViewMode('cards');
  };

  const copyJson = () => {
    const textToCopy = fullResponse ? JSON.stringify(fullResponse, null, 2) : '';
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('Copy JSON'), 2000);
    }
  };

  const overallQuality: OverallQuality | undefined = fullResponse?.data?.overallQuality;
  const grade = overallQuality?.grade?.toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b-4 border-[#007b83] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/logo.png" alt="SLIC Logo" className="h-12 w-auto object-contain" />
            <div className="h-8 w-px bg-gray-300 mx-2 hidden sm:block"></div>
            <div>
              <h1 className="text-2xl font-bold text-[#007b83] leading-tight tracking-tight">Vehicle OCR Portal</h1>
              <p className="text-xs text-gray-500 font-medium">Sri Lanka Insurance General</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Uploader Section */}
          {!extractedData && !loading && !error && (
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-extrabold text-[#007b83] tracking-tight">Upload Registration Certificate</h2>
                <p className="text-gray-600 max-w-xl mx-auto text-sm font-medium">
                  Upload an image (PNG, JPG, WEBP) or PDF of a Sri Lankan Certificate of Registration. 
                  Document quality will be evaluated and all 28 topics extracted securely.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-xl shadow-teal-900/5 border border-gray-100">
                <Uploader onFileSelect={handleFileSelect} disabled={loading} />
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-xl border border-gray-100 space-y-4">
              <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-[#00bcd4] rounded-full animate-ping opacity-50"></div>
                <div className="w-16 h-16 border-4 border-[#007b83] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-[#007b83]">Analyzing document…</h3>
                <p className="text-sm text-gray-500 mt-1 font-medium">This can take up to a minute.</p>
              </div>
              <div className="w-64 bg-gray-100 h-2 rounded-full overflow-hidden mt-4">
                <div className="bg-[#007b83] h-full w-full animate-[loading_1.5s_infinite]"></div>
              </div>
            </div>
          )}

          {/* Clean Error State (Grandma-Proof) */}
          {error && !loading && (
            <div
              role="alert"
              className="max-w-2xl mx-auto bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mt-4 flex items-center justify-between gap-4 shadow-sm"
            >
              <p className="font-semibold text-sm">{error}</p>
              <button
                onClick={reset}
                className="shrink-0 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-bold transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* Results Area */}
          {extractedData && (
            <div className="space-y-6">
              {/* Quality Banner & Controls Header */}
              <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex flex-wrap items-center justify-between gap-4 border-t-4 border-t-[#007b83]">
                <div className="flex items-center space-x-3">
                  {/* Quality Badge */}
                  {grade === 'GOOD' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
                      ✅ GOOD
                    </span>
                  )}
                  {grade === 'FAIR' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
                      ⚠️ FAIR — needs review
                    </span>
                  )}
                  {grade === 'POOR' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-300">
                      ⚠️ POOR — needs review
                    </span>
                  )}

                  {overallQuality && (
                    <span className="text-xs font-semibold text-gray-700">
                      Quality: {Math.round((overallQuality.score || 0) * 100)}% {overallQuality.grade}
                    </span>
                  )}
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center space-x-2">
                  <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                        viewMode === 'cards' ? 'bg-white text-[#007b83] shadow-sm' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Cards
                    </button>
                    <button
                      onClick={() => setViewMode('json')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                        viewMode === 'json' ? 'bg-white text-[#007b83] shadow-sm' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      JSON
                    </button>
                  </div>

                  <button
                    onClick={reset}
                    className="px-4 py-1.5 bg-[#007b83] hover:bg-teal-800 text-white rounded-lg text-xs font-bold shadow-md transition"
                  >
                    New Upload
                  </button>
                </div>
              </div>

              {/* Warning Banner if needsReview is true */}
              {overallQuality?.needsReview && (
                <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg text-xs text-yellow-800 flex items-center justify-between">
                  <span>
                    ⚠️ <strong>Document Needs Review:</strong> Document quality or edge contrast is degraded. Flagged fields are highlighted with low confidence.
                  </span>
                  {overallQuality?.flaggedFields && overallQuality.flaggedFields.length > 0 && (
                    <span className="font-semibold text-yellow-900 ml-2">
                      ({overallQuality.flaggedFields.length} flagged)
                    </span>
                  )}
                </div>
              )}

              {/* View Mode Content */}
              {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Document Preview & Meta */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100">
                      <h3 className="font-bold text-gray-700 text-sm mb-3">Uploaded Document</h3>
                      {previewUrl ? (
                        <img 
                          src={previewUrl} 
                          alt="Vehicle CR" 
                          className="w-full h-auto rounded-lg shadow-inner border border-gray-200"
                        />
                      ) : (
                        <div className="p-6 bg-teal-50 border border-teal-200 rounded-xl flex flex-col items-center justify-center text-center">
                          <svg className="w-12 h-12 text-[#00bcd4] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                          </svg>
                          <p className="font-semibold text-gray-800 text-xs break-all">{selectedFile?.name}</p>
                          <p className="text-[10px] text-gray-500 mt-1">
                            {selectedFile ? (selectedFile.size / 1024).toFixed(1) + ' KB' : ''} • PDF / Document
                          </p>
                        </div>
                      )}

                      {fullResponse && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Processing Time:</span>
                            <span className="font-medium">{(fullResponse.meta.durationMs / 1000).toFixed(2)}s</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Vision Model:</span>
                            <span className="font-mono text-[10px]">{fullResponse.meta.model}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cards Display */}
                  <div className="lg:col-span-2">
                    <ResultDisplay 
                      data={extractedData} 
                      overallQuality={overallQuality} 
                      fieldConfidence={fullResponse?.data?.fieldConfidence}
                    />
                  </div>
                </div>
              ) : (
                /* JSON Display Mode */
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <h3 className="text-sm font-bold text-[#007b83]">Complete JSON Response</h3>
                    <button
                      onClick={copyJson}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded text-xs font-semibold shadow-sm transition"
                    >
                      {copyStatus}
                    </button>
                  </div>
                  <pre className="bg-gray-900 text-green-300 p-4 rounded-xl overflow-auto text-xs font-mono max-h-[600px] leading-relaxed">
                    {JSON.stringify(fullResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>

      <footer className="fixed bottom-3 right-4 text-xs text-gray-400 select-none">
        v1.0.1
      </footer>
    </div>
  );
};

export default App;