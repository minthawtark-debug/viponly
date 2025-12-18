import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface MemberCardProps {
  member: {
    id: string;
    name: string;
    bio: string | null;
    location: string | null;
    member_type: string;
    cover_image_url: string | null;
  };
}

export function MemberCard({ member }: MemberCardProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: albumImages = [] } = useQuery({
    queryKey: ['member-album', member.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('member_images')
        .select('*')
        .eq('member_id', member.id)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="group relative overflow-hidden rounded-lg border border-gold/20 bg-card/50 backdrop-blur-sm transition-all hover:border-gold/40 hover:shadow-lg hover:shadow-gold/10">
      {/* Cover Image */}
      <div className="aspect-[3/4] overflow-hidden">
        {member.cover_image_url ? (
          <img
            src={member.cover_image_url}
            alt={member.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-muted-foreground">No Image</span>
          </div>
        )}
      </div>

      {/* Info Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background/95 via-background/50 to-transparent p-4">
        <h3 className="font-display text-xl font-bold text-gold-gradient">{member.name}</h3>
        {member.location && (
          <p className="text-sm text-muted-foreground">{member.location}</p>
        )}
        {member.bio && (
          <p className="mt-2 line-clamp-2 text-sm text-foreground/80">{member.bio}</p>
        )}

        {/* Album Thumbnails */}
        {albumImages.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {albumImages.slice(0, 4).map((img) => (
              <Dialog key={img.id}>
                <DialogTrigger asChild>
                  <button
                    onClick={() => setSelectedImage(img.image_url)}
                    className="h-12 w-12 flex-shrink-0 overflow-hidden rounded border border-gold/30 transition-all hover:border-gold"
                  >
                    <img
                      src={img.image_url}
                      alt="Album"
                      className="h-full w-full object-cover"
                    />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl border-gold/30 bg-background/95 p-2">
                  <img
                    src={img.image_url}
                    alt="Album"
                    className="h-auto w-full rounded"
                  />
                </DialogContent>
              </Dialog>
            ))}
            {albumImages.length > 4 && (
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded border border-gold/30 bg-muted text-xs text-muted-foreground">
                +{albumImages.length - 4}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
