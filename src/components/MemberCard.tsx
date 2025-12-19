import { useState } from 'react';
import { ProfileModal } from './ProfileModal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="group text-left w-full overflow-hidden rounded-xl border border-gold/20 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-gold/50 hover:shadow-gold focus:outline-none focus:ring-2 focus:ring-gold/50"
      >
        {/* Cover Image */}
        <div className="relative aspect-[3/4] overflow-hidden">
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

          {/* Name Overlay - Top Left */}
          <div className="absolute top-0 left-0 m-3">
            <div className="px-3 py-1.5 rounded-md bg-background/80 backdrop-blur-sm border border-gold/30">
              <span className="font-display text-sm md:text-base font-semibold text-gold">
                {member.name}
              </span>
            </div>
          </div>

          {/* Subtle Gold Glow on Hover */}
          <div className="absolute inset-0 bg-gold/0 transition-all duration-300 group-hover:bg-gold/5" />
        </div>

        {/* Description Below Image */}
        <div className="p-4 border-t border-gold/10">
          {member.bio ? (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {member.bio}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground/50 italic">
              No description
            </p>
          )}
        </div>
      </button>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        member={member}
      />
    </>
  );
}
