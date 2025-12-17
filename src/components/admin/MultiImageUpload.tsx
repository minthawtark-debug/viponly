import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { X, Plus, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImageItem {
  url: string;
  isNew?: boolean;
  file?: File;
}

interface MultiImageUploadProps {
  bucket: 'member-albums';
  value: string[];
  onChange: (urls: string[]) => void;
  className?: string;
}

export function MultiImageUpload({ bucket, value, onChange, className }: MultiImageUploadProps) {
  const [images, setImages] = useState<ImageItem[]>(value.map(url => ({ url })));
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not an image.`,
          variant: 'destructive',
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `${file.name} is larger than 5MB.`,
          variant: 'destructive',
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of validFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      const newImages = [...images, ...uploadedUrls.map(url => ({ url }))];
      setImages(newImages);
      onChange(newImages.map(img => img.url));

      toast({
        title: 'Upload successful',
        description: `${validFiles.length} image(s) uploaded.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload images. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onChange(newImages.map(img => img.url));
  };

  return (
    <div className={cn('space-y-4', className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        multiple
        className="hidden"
      />

      <div className="grid grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group aspect-square">
            <img
              src={image.url}
              alt={`Album image ${index + 1}`}
              className="w-full h-full object-cover rounded-lg border border-border"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 p-1 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4 text-destructive" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors"
        >
          {isUploading ? (
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          ) : (
            <>
              <Plus className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Add</span>
            </>
          )}
        </button>
      </div>

      {images.length === 0 && !isUploading && (
        <p className="text-sm text-muted-foreground text-center">
          No album images yet. Click the + button to add images.
        </p>
      )}
    </div>
  );
}
