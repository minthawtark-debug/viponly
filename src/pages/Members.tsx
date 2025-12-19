import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MemberCard } from '@/components/MemberCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import CrownIcon from '@/components/CrownIcon';
import { ArrowLeft } from 'lucide-react';

const Members = () => {
  const { data: members = [], isLoading } = useQuery({
    queryKey: ['public-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('show_on_member_page', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-gradient-radial">
      {/* Header */}
      <header className="border-b border-gold/20 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2 group">
            <CrownIcon className="h-8 w-8 text-gold transition-transform group-hover:scale-110" />
            <span className="font-display text-xl font-bold text-gold-gradient">VIP CLUB</span>
          </Link>
          <Link 
            to="/" 
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 text-muted-foreground transition-all hover:text-gold hover:border-gold hover:bg-gold/5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-16">
        {/* Page Title */}
        <div className="mb-16 text-center animate-fade-in">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-gold-shimmer mb-4">
            Members Area
          </h1>
          <p className="text-muted-foreground text-xl md:text-2xl tracking-wider">
            会员专区
          </p>
          <div className="mt-6 w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto" />
        </div>

        {/* Members Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] rounded-xl" />
                <Skeleton className="h-12 rounded-lg" />
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="py-24 text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <CrownIcon className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg">No members to display yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {members.map((member, index) => (
              <div 
                key={member.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <MemberCard member={member} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
};

export default Members;
