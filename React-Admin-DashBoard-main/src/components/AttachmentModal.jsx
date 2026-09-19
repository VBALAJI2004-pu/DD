import React from "react";
import { MdClose, MdDownload } from "react-icons/md";
import { useStateContext } from "../contexts/ContextProvider";
import { getImageBaseUrl, getAttachmentUrl } from "../Library/Axios";

const AttachmentModal = ({ isOpen, onClose, fileUrl, fileName }) => {
  const { currentMode } = useStateContext();

  if (!isOpen) return null;

  // Debug attachment modal data
  console.log('🔍 ATTACHMENT MODAL DEBUG:', {
    isOpen,
    fileUrl,
    fileName,
    rawFileUrl: fileUrl
  });

  const fullFileUrl = getAttachmentUrl(fileUrl);
  
  console.log('🔗 ATTACHMENT URL CONSTRUCTION:', {
    originalUrl: fileUrl,
    constructedUrl: fullFileUrl,
    baseUrl: getImageBaseUrl()
  });

  const handleDownload = async () => {
    try {
      // For blob URLs (newly uploaded files), download directly
      if (fileUrl.startsWith('blob:')) {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName || 'attachment';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // Extract filename from URL for API download endpoint
      const filename = fileUrl.split('/').pop();
      const baseUrl = getImageBaseUrl();
      const downloadUrl = `${baseUrl}/api/expense/download/${filename}`;
      
      const token = localStorage.getItem('token');
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || filename || 'attachment';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to direct link
      const link = document.createElement('a');
      link.href = fullFileUrl;
      link.download = fileName || 'attachment';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isImage = fullFileUrl && (fullFileUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i));
  const isPDF = fullFileUrl && fullFileUrl.match(/\.pdf$/i);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-4xl max-h-[90vh] w-full rounded-lg shadow-xl overflow-hidden ${
        currentMode === "Dark" ? "bg-gray-800" : "bg-white"
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          currentMode === "Dark" ? "border-gray-700" : "border-gray-200"
        }`}>
          <h3 className={`text-lg font-semibold ${
            currentMode === "Dark" ? "text-white" : "text-gray-900"
          }`}>
            View Attachment
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              currentMode === "Dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-auto">
          {isImage ? (
            <img
              src={fullFileUrl}
              alt="Attachment"
              className="max-w-full h-auto rounded-lg shadow-sm"
              onError={(e) => {
                console.error('Image load error for URL:', fullFileUrl);
                e.target.style.display = 'none';
                const errorDiv = e.target.parentNode.querySelector('.error-message') || document.createElement('div');
                errorDiv.className = 'error-message text-center py-4 text-red-500';
                errorDiv.innerHTML = 'Failed to load image. Please try downloading the file.';
                if (!e.target.parentNode.querySelector('.error-message')) {
                  e.target.parentNode.appendChild(errorDiv);
                }
              }}
            />
          ) : isPDF ? (
            <div className="relative">
              <iframe
                src={`${fullFileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-96 border rounded-lg"
                title="PDF Viewer"
                onError={(e) => {
                  console.error('PDF load error:', e);
                }}
              />
              <div className="mt-2 text-sm text-gray-500">
                If PDF doesn't load, try downloading it or opening in a new tab.
              </div>
            </div>
          ) : (
            <div className={`text-center py-8 ${
              currentMode === "Dark" ? "text-gray-300" : "text-gray-600"
            }`}>
              <div className="mb-4">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-lg font-medium">File Preview Not Available</p>
              <p className="text-sm mt-2">Click download to view the file</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end gap-3 p-4 border-t ${
          currentMode === "Dark" ? "border-gray-700" : "border-gray-200"
        }`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              currentMode === "Dark"
                ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <MdDownload size={20} />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttachmentModal;
