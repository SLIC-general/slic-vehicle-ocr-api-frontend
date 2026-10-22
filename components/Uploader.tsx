import React, { useRef } from 'react';

interface UploaderProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

const Uploader: React.FC<UploaderProps> = ({ onFileSelect, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 flex flex-col items-center justify-center space-y-4 cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed border-gray-300' : 'hover:border-blue-500 hover:bg-blue-50 border-gray-400'}`}
      onClick={!disabled ? triggerUpload : undefined}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        disabled={disabled}
      />
      <div className="bg-blue-100 p-4 rounded-full">
       <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#00bcd4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
</svg>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800">Upload Registration Certificate</h3>
        <p className="text-sm text-gray-500 mt-1">PNG, JPG or PDF up to 10MB</p>
      </div>
      <button 
  type="button"
  className={`px-6 py-2 text-white rounded-lg font-medium shadow-sm transition-colors
    ${disabled ? 'bg-gray-400' : 'bg-[#007b83] hover:bg-teal-800'}`}
  disabled={disabled}
  onClick={(e) => {
    e.stopPropagation();
    triggerUpload();
  }}
>
  Browse Files
</button> 
    </div>
  );
};

export default Uploader;
