import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Link as LinkIcon, Check, Copy, ExternalLink } from 'lucide-react';
import { endpoints } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

/**
 * Reusable Image Uploader Component
 * Supports direct file picking, drag & drop, instant preview, and direct URL input.
 *
 * @param {string|string[]} value - Current image URL(s)
 * @param {function} onChange - Change handler (receives string or array of strings)
 * @param {string} folder - Supabase storage folder ('products', 'categories', 'avatars', 'topup')
 * @param {boolean} multiple - Allow multiple image uploads
 * @param {string} label - Input label
 * @param {string} helperText - Additional guidance text
 */
export function ImageUploader({
  value = '',
  onChange,
  folder = 'products',
  multiple = false,
  label = 'Upload Image',
  helperText = 'PNG, JPG, WebP, GIF up to 10MB'
}) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showDirectUrl, setShowDirectUrl] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const fileInputRef = useRef(null);
  const toast = useToast();

  const imagesList = Array.isArray(value)
    ? value
    : typeof value === 'string' && value.trim()
    ? value.split('\n').map((s) => s.trim()).filter(Boolean)
    : [];

  const handleUploadFiles = async (files) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileList.length === 0) {
      toast.error('Please select valid image files (PNG, JPG, WebP, GIF).');
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = fileList.map((f) => endpoints.uploadImage(f, folder));
      const results = await Promise.all(uploadPromises);

      const successfulUrls = results
        .filter((r) => r.success && r.data?.url)
        .map((r) => r.data.url);

      if (successfulUrls.length === 0) {
        throw new Error('Upload returned no URL');
      }

      toast.success(
        successfulUrls.length === 1
          ? 'Image uploaded successfully!'
          : `${successfulUrls.length} images uploaded successfully!`
      );

      if (multiple) {
        const nextList = [...imagesList, ...successfulUrls];
        if (onChange) onChange(nextList);
      } else {
        if (onChange) onChange(successfulUrls[0]);
      }
    } catch (err) {
      toast.error(err.message || 'Image upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e) => {
    handleUploadFiles(e.target.files);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    if (multiple) {
      const nextList = imagesList.filter((_, idx) => idx !== indexToRemove);
      if (onChange) onChange(nextList);
    } else {
      if (onChange) onChange('');
    }
  };

  const handleAddManualUrl = (e) => {
    e.preventDefault();
    const trimmed = manualUrl.trim();
    if (!trimmed) return;

    if (multiple) {
      const nextList = [...imagesList, trimmed];
      if (onChange) onChange(nextList);
    } else {
      if (onChange) onChange(trimmed);
    }
    setManualUrl('');
    setShowDirectUrl(false);
  };

  return (
    <div className="space-y-2">
      {/* Label and actions */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
          <span>{label}</span>
        </label>
        <button
          type="button"
          onClick={() => setShowDirectUrl(!showDirectUrl)}
          className="text-[11px] font-semibold text-slate-400 hover:text-pink-400 flex items-center gap-1 transition-colors"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showDirectUrl ? 'Hide URL link' : 'Paste URL link'}</span>
        </button>
      </div>

      {/* Optional Manual URL Input */}
      {showDirectUrl && (
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 animate-in fade-in duration-150">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://example.com/image.png"
            className="flex-1 px-3 py-1.5 text-xs bg-transparent text-white placeholder-slate-500 outline-none"
          />
          <button
            type="button"
            onClick={handleAddManualUrl}
            className="px-3 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            Add
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative p-5 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-2 text-center select-none ${
          dragActive
            ? 'border-pink-500 bg-pink-500/10 scale-[1.01]'
            : 'border-slate-700/80 hover:border-pink-500/60 bg-slate-900/40 hover:bg-slate-900/80'
        }`}
      >
        {uploading ? (
          <div className="py-2 flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
            <p className="text-xs font-bold text-slate-200">Uploading to cloud storage...</p>
            <p className="text-[10px] text-slate-400">Optimizing and generating public CDN link</p>
          </div>
        ) : (
          <>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-sm group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">
                <span className="text-pink-400 underline">Click to upload</span> or drag and drop
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">{helperText}</p>
            </div>
          </>
        )}
      </div>

      {/* Image Preview Grid */}
      {imagesList.length > 0 && (
        <div className="pt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
          {imagesList.map((imgUrl, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group shadow-md"
            >
              <img
                src={imgUrl}
                alt={`Uploaded ${index + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.target.src = '/categories/topup.png';
                }}
              />

              {/* Top overlay remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(index);
                }}
                className="absolute top-1 right-1 p-1 rounded-lg bg-slate-950/80 hover:bg-rose-500 text-slate-300 hover:text-white transition-all shadow-sm active:scale-95"
                title="Remove image"
              >
                <X className="w-3 h-3" />
              </button>

              {/* View full link in new tab */}
              <a
                href={imgUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-1 right-1 p-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                title="Open image"
              >
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
