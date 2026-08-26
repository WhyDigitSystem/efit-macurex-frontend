import { X, Download } from "lucide-react";

const PDFPreviewModal = ({ blobUrl, fileName, onClose }) => {
  const handleDownload = () => {
    if (!blobUrl) return;
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName || "document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!blobUrl) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="relative flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-[90vw] h-[90vh] max-w-[1000px]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
            PDF Preview
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden rounded-b-lg">
          <iframe
            src={blobUrl}
            title="PDF Preview"
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal;
