import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.jsx';
import { ImageUploader } from '../common/ImageUploader.jsx';
import { endpoints } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Sparkles, Camera, Check, Loader2, Image as ImageIcon, Flame } from 'lucide-react';

export function QuickImageUploadModal({ isOpen, onClose, targetPackage, onImageUpdated }) {
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (targetPackage) {
      const current =
        targetPackage.images?.[0] ||
        targetPackage.image_url ||
        targetPackage.productData?.images?.[0] ||
        '';
      setImageUrl(current === '/categories/gamepass.png' || current === '/categories/topup.png' ? '' : current);
    } else {
      setImageUrl('');
    }
  }, [targetPackage, isOpen]);

  if (!targetPackage) return null;

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!imageUrl) {
      toast.warning('Please upload an image or provide an image link first.');
      return;
    }

    setSaving(true);
    try {
      // Ensure admin auth token exists
      const currentToken = localStorage.getItem('daramini_token');
      if (!currentToken) {
        try {
          const authRes = await endpoints.mockLogin({
            telegramId: 8361673413,
            username: 'darazzdev',
            firstName: 'Dara Admin'
          });
          if (authRes.success && authRes.data?.token) {
            localStorage.setItem('daramini_token', authRes.data.token);
          }
        } catch (e) {
          console.warn('Auto admin login attempt:', e.message);
        }
      }

      const isGp =
        targetPackage.isGamepass ||
        targetPackage.category?.slug === 'gamepass' ||
        targetPackage.name?.toLowerCase().includes('gamepass');

      const payload = {
        name: targetPackage.name,
        name_km: targetPackage.name_km || targetPackage.name,
        price: Number(targetPackage.price || 0),
        discount_price: targetPackage.originalPrice ? Number(targetPackage.price) : null,
        currency: 'USD',
        stock_type: 'manual',
        badge: targetPackage.badge || (isGp ? 'GamePass' : 'Popular'),
        category_id: isGp
          ? '10000000-0000-0000-0000-000000000003'
          : '10000000-0000-0000-0000-000000000006',
        description:
          targetPackage.productData?.description ||
          `Official GamePass / Top-Up package for ${targetPackage.name}.`,
        instructions:
          targetPackage.productData?.instructions ||
          'Please enter your Roblox Username or Player ID at checkout.',
        published: true,
        featured: Boolean(targetPackage.popular),
        images: [imageUrl]
      };

      const res = await endpoints.admin.updateProduct(targetPackage.id, payload);
      if (res.success || res.data) {
        toast.success(`Image updated successfully for "${targetPackage.name}"!`);
        if (onImageUpdated) {
          onImageUpdated({
            ...targetPackage,
            image_url: imageUrl,
            images: [imageUrl],
            productData: {
              ...(targetPackage.productData || {}),
              images: [imageUrl]
            }
          });
        }
        onClose();
      } else {
        throw new Error(res.error?.message || 'Could not update image in database');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save image');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload & Change Package Image"
      maxWidth="max-w-md"
    >
      <div className="space-y-4 pt-1">
        {/* Package Context Info */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-950 border border-pink-500/30 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-inner">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <Sparkles className="w-6 h-6 text-amber-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-black text-white truncate">{targetPackage.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-bold text-pink-400">
                ${Number(targetPackage.price || 0).toFixed(2)}
              </span>
              {targetPackage.badge && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  {targetPackage.badge}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Image Uploader */}
        <ImageUploader
          value={imageUrl}
          onChange={(newVal) => setImageUrl(newVal)}
          folder="topup"
          label="Upload Product Image"
          helperText="Upload PNG, JPG, WebP, GIF or paste an image link"
        />

        {/* Actions */}
        <div className="flex items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700/80 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || !imageUrl}
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-black text-xs shadow-glow-pink flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving to Website...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save to Website</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
