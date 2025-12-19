import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MemberCard } from '@/components/MemberCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import CrownIcon from '@/components/CrownIcon';
import { ArrowLeft, ShieldX } from 'lucide-react';

const VIP = () => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  // Check for access from session storage
  useEffect(() => {
    const vipAccess = sessionStorage.getItem('vip_access');
    const targetPage = sessionStorage.getItem('target_page');

    // Allow access if they have vip_access and target_page is 'vip'
    if (vipAccess === 'true' && targetPage === 'vip') {
      setHasAccess(true);
    } else {
      setHasAccess(false);
    }
  }, []);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['vip-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('show_on_vip_page', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: hasAccess === true,
  });

  // Loading state while checking access
  if (hasAccess === null) {
    return (
      <div className="min-h-screen bg-gradient-radial flex items-center justify-center">
        <div className="animate-pulse">
          <CrownIcon className="h-16 w-16 text-primary" />
        </div>
      </div>
    );
  }

  // Access Denied
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-radial">
        {/* Header */}
        <header className="border-b border-primary/20 bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <Link to="/" className="flex items-center gap-2 group">
              <CrownIcon className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
              <span className="font-display text-xl font-bold text-gold-gradient">VIP CLUB</span>
            </Link>
            <Link 
              to="/" 
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 text-muted-foreground transition-all hover:text-primary hover:border-primary hover:bg-primary/5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back</span>
            </Link>
          </div>
        </header>

        {/* Access Denied Content */}
        <main className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[70vh]">
          <div className="text-center animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center">
              <ShieldX className="h-12 w-12 text-destructive" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Access Denied
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              You need a valid VIP access link to view this content.
            </p>
            <Link 
              to="/"
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-full bg-primary/10 border border-primary/30 text-primary font-medium transition-all hover:bg-primary/20 hover:border-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Return Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-radial">
      {/* Header */}
      <header className="border-b border-primary/20 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2 group">
            <CrownIcon className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
            <span className="font-display text-xl font-bold text-gold-gradient">VIP CLUB</span>
          </Link>
          <Link 
            to="/" 
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 text-muted-foreground transition-all hover:text-primary hover:border-primary hover:bg-primary/5"
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
            VIP Area
          </h1>
          <p className="text-muted-foreground text-xl md:text-2xl tracking-wider">
            会员专区
          </p>
          <div className="mt-6 w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
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
            <p className="text-muted-foreground text-lg">No VIP members to display yet.</p>
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

export default VIP;
