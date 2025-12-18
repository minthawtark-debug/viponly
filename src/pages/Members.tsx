import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MemberCard } from '@/components/MemberCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import CrownIcon from '@/components/CrownIcon';

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
      <header className="border-b border-gold/20 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <CrownIcon className="h-8 w-8 text-gold" />
            <span className="font-display text-xl font-bold text-gold-gradient">VIP CLUB</span>
          </Link>
          <nav className="flex gap-4">
            <Link to="/members" className="font-medium text-gold">Members</Link>
            <Link to="/vip" className="text-muted-foreground transition-colors hover:text-gold">VIP</Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gold-shimmer mb-4">
            Members Area
          </h1>
          <p className="text-muted-foreground text-lg">
            会员专区
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">No members to display yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Members;
