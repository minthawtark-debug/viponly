import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Link as LinkIcon, 
  Plus, 
  Copy, 
  Trash2, 
  Clock, 
  Users, 
  Crown,
  CheckCircle,
  XCircle,
  Timer,
  Share2,
  Lock,
  Infinity
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type TargetPage = 'member' | 'vip';

interface AccessLink {
  id: string;
  token: string;
  target_page: TargetPage;
  expires_at: string | null;
  is_used: boolean;
  allow_share: boolean;
  is_permanent: boolean;
  created_at: string;
}

const TIME_OPTIONS = [
  { value: '15', label: '15 Minutes' },
  { value: '60', label: '1 Hour' },
  { value: '1440', label: '24 Hours' },
  { value: 'custom', label: 'Custom' },
];

const BASE_URL = import.meta.env.VITE_NEXT_PUBLIC_SITE_URL;

export default function AccessLinks() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetPage, setTargetPage] = useState<TargetPage>('member');
  const [isPermanent, setIsPermanent] = useState(false);
  const [timeOption, setTimeOption] = useState('60');
  const [customMinutes, setCustomMinutes] = useState('');
  const [allowShare, setAllowShare] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [generatedLinkData, setGeneratedLinkData] = useState<AccessLink | null>(null);

  const queryClient = useQueryClient();

  const { data: accessLinks = [], isLoading } = useQuery({
    queryKey: ['access-links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('access_links')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AccessLink[];
    },
  });

  const createLinkMutation = useMutation({
    mutationFn: async () => {
      const token = crypto.randomUUID();
      let expiresAt: string | null = null;

      if (!isPermanent) {
        const minutes = timeOption === 'custom' ? parseInt(customMinutes) : parseInt(timeOption);
        const expireDate = new Date();
        expireDate.setMinutes(expireDate.getMinutes() + minutes);
        expiresAt = expireDate.toISOString();
      }

      const { data, error } = await supabase
        .from('access_links')
        .insert({
          token,
          target_page: targetPage,
          expires_at: expiresAt,
          is_permanent: isPermanent,
          allow_share: allowShare,
          is_used: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data as AccessLink;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['access-links'] });
      const link = `${BASE_URL}/access?token=${data.token}`;
      setGeneratedLink(link);
      setGeneratedLinkData(data);
      toast.success('Access link generated successfully!');
    },
    onError: (error) => {
      console.error('Error creating link:', error);
      toast.error('Failed to generate access link');
    },
  });

  const revokeLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('access_links')
        .update({ is_used: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-links'] });
      toast.success('Link revoked successfully');
    },
    onError: () => {
      toast.error('Failed to revoke link');
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('access_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-links'] });
      toast.success('Link deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete link');
    },
  });

  const handleGenerate = () => {
    if (!isPermanent && timeOption === 'custom' && (!customMinutes || parseInt(customMinutes) <= 0)) {
      toast.error('Please enter a valid number of minutes');
      return;
    }
    createLinkMutation.mutate();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  const resetModal = () => {
    setTargetPage('member');
    setIsPermanent(false);
    setTimeOption('60');
    setCustomMinutes('');
    setAllowShare(false);
    setGeneratedLink(null);
    setGeneratedLinkData(null);
  };

  const openModal = () => {
    resetModal();
    setIsModalOpen(true);
  };

  const getStatus = (link: AccessLink): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } => {
    if (link.is_used && !link.allow_share) {
      return { label: 'Used', variant: 'secondary' };
    }
    if (!link.is_permanent && link.expires_at && new Date(link.expires_at) < new Date()) {
      return { label: 'Expired', variant: 'destructive' };
    }
    return { label: 'Active', variant: 'default' };
  };

  const getTimeRemaining = (expiresAt: string | null, isPermanent: boolean): string => {
    if (isPermanent) return 'Permanent';
    if (!expiresAt) return 'N/A';
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Access Links Manager</h1>
          <p className="mt-1 text-muted-foreground">Generate and manage access links for Member and VIP pages</p>
        </div>
        <Button onClick={openModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Generate Access Link
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <LinkIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Links</p>
                <p className="text-2xl font-bold text-foreground">{accessLinks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-foreground">
                  {accessLinks.filter(l => getStatus(l).label === 'Active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Links</p>
                <p className="text-2xl font-bold text-foreground">
                  {accessLinks.filter(l => l.target_page === 'member').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2">
                <Crown className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">VIP Links</p>
                <p className="text-2xl font-bold text-foreground">
                  {accessLinks.filter(l => l.target_page === 'vip').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Links Table */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <LinkIcon className="h-5 w-5" />
            Access Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : accessLinks.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No access links generated yet. Click "Generate Access Link" to create one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Generated URL</TableHead>
                  <TableHead className="text-muted-foreground">Target</TableHead>
                  <TableHead className="text-muted-foreground">Expiration</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Sharing</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accessLinks.map((link) => {
                  const status = getStatus(link);
                  return (
                    <TableRow key={link.id} className="border-border hover:bg-muted/50">
                      <TableCell className="font-mono text-xs text-foreground">
                        <div className="flex items-center gap-2">
                          <span className="max-w-[200px] truncate">
                            {`${BASE_URL}/access?token=${link.token}`}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(`${BASE_URL}/access?token=${link.token}`)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={link.target_page === 'vip' ? 'default' : 'secondary'}>
                          {link.target_page === 'vip' ? (
                            <Crown className="mr-1 h-3 w-3" />
                          ) : (
                            <Users className="mr-1 h-3 w-3" />
                          )}
                          {link.target_page.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-foreground">
                        <div className="flex items-center gap-1">
                          {link.is_permanent ? (
                            <Infinity className="h-4 w-4 text-primary" />
                          ) : (
                            <Timer className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span>{getTimeRemaining(link.expires_at, link.is_permanent)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-border">
                          {link.is_permanent ? 'Permanent' : 'One-Time'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {link.allow_share ? (
                          <div className="flex items-center gap-1 text-green-500">
                            <Share2 className="h-4 w-4" />
                            <span className="text-xs">Allowed</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Lock className="h-4 w-4" />
                            <span className="text-xs">Blocked</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>
                          {status.label === 'Active' && <CheckCircle className="mr-1 h-3 w-3" />}
                          {status.label === 'Used' && <XCircle className="mr-1 h-3 w-3" />}
                          {status.label === 'Expired' && <Clock className="mr-1 h-3 w-3" />}
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {status.label === 'Active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => revokeLinkMutation.mutate(link.id)}
                              className="border-destructive/50 text-destructive hover:bg-destructive/10"
                            >
                              Revoke
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => deleteLinkMutation.mutate(link.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Generate Link Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-primary">
              {generatedLink ? 'Link Generated!' : 'Generate Access Link'}
            </DialogTitle>
          </DialogHeader>

          {generatedLink ? (
            <div className="space-y-4">
              {/* Generated Link Display */}
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <p className="mb-2 text-sm text-muted-foreground">Your access link:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 break-all rounded bg-muted px-2 py-1 text-sm text-foreground">
                    {generatedLink}
                  </code>
                  <Button size="icon" variant="outline" onClick={() => copyToClipboard(generatedLink)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Link Details */}
              <div className="space-y-2 rounded-lg bg-muted/50 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Target Page:</span>
                  <Badge variant={generatedLinkData?.target_page === 'vip' ? 'default' : 'secondary'}>
                    {generatedLinkData?.target_page?.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Expiration:</span>
                  <span className="text-foreground">
                    {getTimeRemaining(generatedLinkData?.expires_at || null, generatedLinkData?.is_permanent || false)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline">
                    {generatedLinkData?.is_permanent ? 'Permanent' : 'One-Time'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sharing:</span>
                  <span className={generatedLinkData?.allow_share ? 'text-green-500' : 'text-muted-foreground'}>
                    {generatedLinkData?.allow_share ? 'Allowed' : 'Blocked'}
                  </span>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
                <Button onClick={openModal}>
                  Generate Another
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Target Page */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">Target Page *</Label>
                <RadioGroup value={targetPage} onValueChange={(v) => setTargetPage(v as TargetPage)}>
                  <div className="flex items-center space-x-2 rounded-lg border border-border p-3 hover:bg-muted/50">
                    <RadioGroupItem value="member" id="member" />
                    <Label htmlFor="member" className="flex flex-1 cursor-pointer items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>Member Page</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg border border-border p-3 hover:bg-muted/50">
                    <RadioGroupItem value="vip" id="vip" />
                    <Label htmlFor="vip" className="flex flex-1 cursor-pointer items-center gap-2">
                      <Crown className="h-4 w-4 text-amber-500" />
                      <span>VIP Page</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Link Type */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">Link Type</Label>
                <RadioGroup value={isPermanent ? 'permanent' : 'onetime'} onValueChange={(v) => setIsPermanent(v === 'permanent')}>
                  <div className="flex items-center space-x-2 rounded-lg border border-border p-3 hover:bg-muted/50">
                    <RadioGroupItem value="onetime" id="onetime" />
                    <Label htmlFor="onetime" className="flex flex-1 cursor-pointer items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>One-Time Use</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg border border-border p-3 hover:bg-muted/50">
                    <RadioGroupItem value="permanent" id="permanent" />
                    <Label htmlFor="permanent" className="flex flex-1 cursor-pointer items-center gap-2">
                      <Infinity className="h-4 w-4 text-primary" />
                      <span>Permanent Link</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Time Limit */}
              {!isPermanent && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">Time Limit</Label>
                  <RadioGroup value={timeOption} onValueChange={setTimeOption}>
                    {TIME_OPTIONS.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2 rounded-lg border border-border p-3 hover:bg-muted/50">
                        <RadioGroupItem value={option.value} id={`time-${option.value}`} />
                        <Label htmlFor={`time-${option.value}`} className="flex-1 cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {timeOption === 'custom' && (
                    <div className="mt-2">
                      <Input
                        type="number"
                        placeholder="Enter minutes"
                        value={customMinutes}
                        onChange={(e) => setCustomMinutes(e.target.value)}
                        min="1"
                        className="border-border bg-input"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Sharing Permission */}
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium text-foreground">Allow Sharing</Label>
                  <p className="text-xs text-muted-foreground">
                    {allowShare ? 'Link can be used on multiple devices' : 'First use locks the link'}
                  </p>
                </div>
                <Switch checked={allowShare} onCheckedChange={setAllowShare} />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGenerate} disabled={createLinkMutation.isPending}>
                  {createLinkMutation.isPending ? 'Generating...' : 'Generate Link'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
