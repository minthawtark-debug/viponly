import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, Crown, User, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Member {
  id: string;
  name: string;
  location: string | null;
  member_type: string;
  cover_image_url: string | null;
  created_at: string;
  show_on_member_page: boolean;
  show_on_vip_page: boolean;
}

export default function MemberList() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load members.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMembers(members.filter(m => m.id !== id));
      toast({
        title: 'Deleted',
        description: 'Member has been removed.',
      });
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete member.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-gold-gradient mb-2">Members</h1>
          <p className="text-muted-foreground">Manage VIP club members</p>
        </div>
        <Link to="/admin/members/new">
          <Button variant="vipGold" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Member
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-primary">Loading members...</div>
        </div>
      ) : members.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No members yet</p>
            <Link to="/admin/members/new">
              <Button variant="vipGold">Add Your First Member</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <Card key={member.id} className="bg-card border-border overflow-hidden group">
              <div className="relative h-48 bg-muted">
                {member.cover_image_url ? (
                  <img
                    src={member.cover_image_url}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-16 h-16 text-muted-foreground/50" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={member.member_type === 'VIP' ? 'default' : 'secondary'}
                    className={member.member_type === 'VIP' ? 'bg-primary text-primary-foreground' : ''}
                  >
                    {member.member_type === 'VIP' && <Crown className="w-3 h-3 mr-1" />}
                    {member.member_type}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-display text-lg text-foreground mb-2">{member.name}</h3>
                {member.location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3" />
                    {member.location}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mb-4">
                  Created: {new Date(member.created_at).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <Link to={`/admin/members/${member.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1">
                      <Edit className="w-3 h-3" />
                      Edit
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Member</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {member.name}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(member.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
