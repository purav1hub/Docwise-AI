import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, AlertCircle, Loader2, X, FilePlus } from 'lucide-react';
import { FileData } from '../types';

interface FileUploadProps {
  onFilesSelect: (data: FileData[]) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelect, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileData[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFiles = async (files: FileList) => {
    setError(null);
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const newFiles: FileData[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!validTypes.includes(file.type)) {
        setError(`"${file.name}" is an unsupported format. Use PDF, JPG, or PNG.`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError(`"${file.name}" is too large (max 10MB).`);
        continue;
      }

      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            resolve(result.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newFiles.push({
          file,
          base64,
          mimeType: file.type
        });
      } catch (err) {
        setError(`Failed to read "${file.name}".`);
      }
    }

    if (newFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  }, [selectedFiles]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = () => {
    if (selectedFiles.length > 0) {
      onFilesSelect(selectedFiles);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div 
        className={`relative group border-2 border-dashed rounded-2xl p-10 transition-all duration-300 ease-in-out text-center
          ${dragActive ? 'border-brand-500 bg-brand-50 scale-[1.01]' : 'border-slate-300 hover:border-brand-400 bg-white shadow-sm'}
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          id="file-upload-main" 
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleChange}
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          disabled={isLoading}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`p-5 rounded-full ${dragActive ? 'bg-brand-100 text-brand-600' : 'bg-slate-50 text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-500'} transition-all`}>
            <UploadCloud size={40} strokeWidth={1.5} />
          </div>
          
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-800">
              Drop your documents here
            </h3>
            <p className="text-sm text-slate-500">
              PDF, JPG, or PNG up to 10MB each
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 uppercase tracking-widest pt-2">
            <span>Contracts</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>Policies</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>Agreements</span>
          </div>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-bold text-slate-700">{selectedFiles.length} file(s) ready</span>
            <button 
              onClick={() => setSelectedFiles([])}
              className="text-xs text-red-500 font-bold hover:underline"
              disabled={isLoading}
            >
              Clear All
            </button>
          </div>
          
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {selectedFiles.map((f, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                    <FileText size={18} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 truncate">{f.file.name}</span>
                </div>
                <button 
                  onClick={() => removeFile(i)} 
                  className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg text-slate-400 transition-colors"
                  disabled={isLoading}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-black text-white shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-3
              ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 hover:shadow-brand-200'}
            `}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <FilePlus size={20} />
            )}
            {isLoading ? 'Analyzing...' : (selectedFiles.length > 1 ? `Compare ${selectedFiles.length} Documents` : 'Start Analysis')}
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 text-sm animate-in shake duration-300">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <p className="font-medium">{error}</p>
        </div>
      )}
    </div>
  );
};