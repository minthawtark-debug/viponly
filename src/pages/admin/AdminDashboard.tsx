import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Crown, UserPlus, MapPin } from 'lucide-react';

interface Stats {
  totalMembers: number;
  vipMembers: number;
  regularMembers: number;
  locations: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    vipMembers: 0,
    regularMembers: 0,
    locations: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: members, error } = await supabase
        .from('members')
        .select('member_type, location');

      if (error) throw error;

      if (members) {
        const vipCount = members.filter(m => m.member_type === 'VIP').length;
        const uniqueLocations = new Set(members.map(m => m.location).filter(Boolean)).size;

        setStats({
          totalMembers: members.length,
          vipMembers: vipCount,
          regularMembers: members.length - vipCount,
          locations: uniqueLocations,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Members', value: stats.totalMembers, icon: Users, color: 'text-primary' },
    { title: 'VIP Members', value: stats.vipMembers, icon: Crown, color: 'text-primary' },
    { title: 'Regular Members', value: stats.regularMembers, icon: Users, color: 'text-muted-foreground' },
    { title: 'Locations', value: stats.locations, icon: MapPin, color: 'text-primary' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display text-gold-gradient mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the VIP Club Admin Panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display text-foreground">
                {isLoading ? '...' : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-display">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/admin/members/new">
              <Button variant="vipGold" className="w-full justify-start gap-3">
                <UserPlus className="w-5 h-5" />
                Add New Member
              </Button>
            </Link>
            <Link to="/admin/members">
              <Button variant="outline" className="w-full justify-start gap-3">
                <Users className="w-5 h-5" />
                View All Members
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-display">Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">1.</span>
                Add member profiles with photos and bios
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">2.</span>
                Upload cover images and album galleries
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">3.</span>
                Set visibility for Member or VIP pages
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">4.</span>
                Manage and update profiles anytime
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
