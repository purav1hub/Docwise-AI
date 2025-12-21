import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, AlertCircle, Loader2, X } from 'lucide-react';
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
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const processFiles = async (files: FileList) => {
    setError(null);
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const newFileData: FileData[] = [];

    for (const file of Array.from(files)) {
      if (!validTypes.includes(file.type)) {
        setError("Invalid file type. Use PDF or Images.");
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("One or more files exceed 10MB limit.");
        continue;
      }

      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });

      newFileData.push({ file, base64, mimeType: file.type });
    }

    const updated = [...selectedFiles, ...newFileData];
    setSelectedFiles(updated);
  };

  const removeFile = (idx: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div 
        className={`relative group border-2 border-dashed rounded-xl p-8 transition-all duration-300 ease-in-out text-center
          ${dragActive ? 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:border-brand-400 bg-white'}
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if(e.dataTransfer.files) processFiles(e.dataTransfer.files); }}
      >
        <input type="file" multiple id="file-upload" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={(e) => e.target.files && processFiles(e.target.files)} disabled={isLoading}
          accept=".pdf,.jpg,.jpeg,.png,.webp"
        />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 rounded-full bg-slate-100 text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-500 transition-colors">
            <UploadCloud size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-800">Upload documents</h3>
            <p className="text-sm text-slate-500">Add 2+ docs for Comparison Mode</p>
          </div>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((f, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-brand-500" />
                <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{f.file.name}</span>
              </div>
              <button onClick={() => removeFile(i)} className="p-1 hover:bg-slate-100 rounded text-slate-400"><X size={16} /></button>
            </div>
          ))}
          <button 
            onClick={() => onFilesSelect(selectedFiles)}
            className="w-full py-3 bg-brand-600 text-white rounded-lg font-bold shadow-md hover:bg-brand-700 transition-all flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : null}
            {selectedFiles.length > 1 ? `Compare ${selectedFiles.length} Documents` : 'Analyze Document'}
          </button>
        </div>
      )}

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm"><AlertCircle size={16} />{error}</div>}
    </div>
  );
};