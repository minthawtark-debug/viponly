import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from './ImageUpload';
import { MultiImageUpload } from './MultiImageUpload';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const memberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  bio: z.string().max(1000).optional(),
  location: z.string().max(100).optional(),
  member_type: z.enum(['VIP', 'Member']),
  cover_image_url: z.string().optional(),
  show_on_member_page: z.boolean(),
  show_on_vip_page: z.boolean(),
});

interface MemberFormProps {
  memberId?: string;
}

export function MemberForm({ memberId }: MemberFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    member_type: 'Member' as 'VIP' | 'Member',
    cover_image_url: '',
    show_on_member_page: false,
    show_on_vip_page: false,
  });
  const [albumImages, setAlbumImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!memberId);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (memberId) {
      fetchMember();
    }
  }, [memberId]);

  const fetchMember = async () => {
    try {
      const { data: member, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', memberId)
        .maybeSingle();

      if (error) throw error;
      
      if (member) {
        setFormData({
          name: member.name,
          bio: member.bio || '',
          location: member.location || '',
          member_type: member.member_type as 'VIP' | 'Member',
          cover_image_url: member.cover_image_url || '',
          show_on_member_page: member.show_on_member_page || false,
          show_on_vip_page: member.show_on_vip_page || false,
        });

        const { data: images } = await supabase
          .from('member_images')
          .select('image_url')
          .eq('member_id', memberId)
          .order('display_order');

        if (images) {
          setAlbumImages(images.map(img => img.image_url));
        }
      }
    } catch (error) {
      console.error('Error fetching member:', error);
      toast({
        title: 'Error',
        description: 'Failed to load member data.',
        variant: 'destructive',
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validation = memberSchema.safeParse(formData);
      if (!validation.success) {
        toast({
          title: 'Validation Error',
          description: validation.error.errors[0].message,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (memberId) {
        const { error } = await supabase
          .from('members')
          .update(formData)
          .eq('id', memberId);

        if (error) throw error;

        await supabase
          .from('member_images')
          .delete()
          .eq('member_id', memberId);

        if (albumImages.length > 0) {
          const imageRecords = albumImages.map((url, index) => ({
            member_id: memberId,
            image_url: url,
            display_order: index,
          }));

          const { error: imgError } = await supabase
            .from('member_images')
            .insert(imageRecords);

          if (imgError) throw imgError;
        }

        toast({
          title: 'Success',
          description: 'Member updated successfully.',
        });
      } else {
        const { data: newMember, error } = await supabase
          .from('members')
          .insert(formData)
          .select()
          .single();

        if (error) throw error;

        if (albumImages.length > 0 && newMember) {
          const imageRecords = albumImages.map((url, index) => ({
            member_id: newMember.id,
            image_url: url,
            display_order: index,
          }));

          const { error: imgError } = await supabase
            .from('member_images')
            .insert(imageRecords);

          if (imgError) throw imgError;
        }

        toast({
          title: 'Success',
          description: 'Member created successfully.',
        });
      }

      navigate('/admin/members');
    } catch (error) {
      console.error('Error saving member:', error);
      toast({
        title: 'Error',
        description: 'Failed to save member. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Member name"
              className="bg-input border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Member bio..."
              className="bg-input border-border min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="City, Country"
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="member_type">Member Type *</Label>
            <Select
              value={formData.member_type}
              onValueChange={(value: 'VIP' | 'Member') => setFormData({ ...formData, member_type: value })}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Member">Member</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <Label>Page Visibility</Label>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Show on Member page</span>
              <Switch
                checked={formData.show_on_member_page}
                onCheckedChange={(checked) => setFormData({ ...formData, show_on_member_page: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Show on VIP page</span>
              <Switch
                checked={formData.show_on_vip_page}
                onCheckedChange={(checked) => setFormData({ ...formData, show_on_vip_page: checked })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Cover Image</Label>
            <ImageUpload
              bucket="member-covers"
              value={formData.cover_image_url}
              onChange={(url) => setFormData({ ...formData, cover_image_url: url })}
            />
          </div>

          <div className="space-y-2">
            <Label>Album Images</Label>
            <MultiImageUpload
              bucket="member-albums"
              value={albumImages}
              onChange={setAlbumImages}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-6 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/admin/members')}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="vipGold"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Saving...' : memberId ? 'Update Member' : 'Create Member'}
        </Button>
      </div>
    </form>
  );
}
