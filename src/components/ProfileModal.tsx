import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ImageViewer } from './ImageViewer';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: {
    id: string;
    name: string;
    bio: string | null;
    location: string | null;
    member_type: string;
    cover_image_url: string | null;
  };
}

export function ProfileModal({ isOpen, onClose, member }: ProfileModalProps) {
  const [viewerImage, setViewerImage] = useState<string | null>(null);

  const { data: albumImages = [], isLoading } = useQuery({
    queryKey: ['member-album-modal', member.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('member_images')
        .select('*')
        .eq('member_id', member.id)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: isOpen,
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 border-gold/30 bg-card/98 backdrop-blur-xl overflow-hidden">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-background/80 border border-gold/30 text-gold hover:bg-gold/20 hover:border-gold transition-all"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="overflow-y-auto max-h-[90vh]">
            {/* Cover Image */}
            <div className="relative aspect-video w-full overflow-hidden">
              {member.cover_image_url ? (
                <img
                  src={member.cover_image_url}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">No Cover Image</span>
                </div>
              )}
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              
              {/* Name */}
              <div className="absolute bottom-6 left-6">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-gold-gradient">
                  {member.name}
                </h2>
                {member.location && (
                  <p className="text-muted-foreground mt-1">{member.location}</p>
                )}
              </div>
            </div>

            {/* Bio Section */}
            {member.bio && (
              <div className="px-6 py-6 border-b border-gold/10">
                <h3 className="font-display text-lg text-gold mb-3">About</h3>
                <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {member.bio}
                </p>
              </div>
            )}

            {/* Album Gallery */}
            <div className="px-6 py-6">
              <h3 className="font-display text-lg text-gold mb-4">Gallery</h3>
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-lg" />
                  ))}
                </div>
              ) : albumImages.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No gallery images
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {albumImages.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setViewerImage(img.image_url)}
                      className="aspect-square overflow-hidden rounded-lg border border-gold/20 hover:border-gold transition-all hover:shadow-gold group"
                    >
                      <img
                        src={img.image_url}
                        alt="Gallery"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Viewer */}
      <ImageViewer
        isOpen={!!viewerImage}
        onClose={() => setViewerImage(null)}
        imageUrl={viewerImage || ''}
      />
    </>
  );
}
