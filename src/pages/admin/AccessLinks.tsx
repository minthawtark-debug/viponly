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

interface AdminToken {
  id: string;
  access_token: string;
  user_id: string | null;
  expires_at: string | null;
  used: boolean;
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
  const [timeOption, setTimeOption] = useState('60');
  const [customMinutes, setCustomMinutes] = useState('');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [generatedTokenData, setGeneratedTokenData] = useState<AdminToken | null>(null);

  const queryClient = useQueryClient();

  const { data: adminTokens = [], isLoading } = useQuery({
    queryKey: ['admin-tokens'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_tokens')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AdminToken[];
    },
  });

  const createLinkMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/generate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate token');
      }

      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-tokens'] });
      setGeneratedLink(data.accessLink);
      setGeneratedTokenData({
        id: '', // We'll get this from the query
        access_token: data.token,
        user_id: null,
        expires_at: data.expiresAt,
        used: false,
        created_at: new Date().toISOString()
      });
      toast.success('Access link generated successfully!');
    },
    onError: (error) => {
      console.error('Error creating link:', error);
      toast.error(error.message || 'Failed to generate access link');
    },
  });

  const revokeLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('admin_tokens')
        .update({ used: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tokens'] });
      toast.success('Token revoked successfully');
    },
    onError: () => {
      toast.error('Failed to revoke token');
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('admin_tokens')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tokens'] });
      toast.success('Token deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete token');
    },
  });

  const handleGenerate = () => {
    createLinkMutation.mutate();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  const resetModal = () => {
    setTimeOption('60');
    setCustomMinutes('');
    setGeneratedLink(null);
    setGeneratedTokenData(null);
  };

  const openModal = () => {
    resetModal();
    setIsModalOpen(true);
  };

  const getStatus = (token: AdminToken): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } => {
    if (token.used) {
      return { label: 'Used', variant: 'secondary' };
    }
    if (token.expires_at && new Date(token.expires_at) < new Date()) {
      return { label: 'Expired', variant: 'destructive' };
    }
    return { label: 'Active', variant: 'default' };
  };

  const getTimeRemaining = (expiresAt: string | null): string => {
    if (!expiresAt) return 'No expiry';
    
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
          <h1 className="font-display text-3xl font-bold text-primary">Access Tokens Manager</h1>
          <p className="mt-1 text-muted-foreground">Generate and manage one-time access tokens for admin panel access</p>
        </div>
        <Button onClick={openModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Generate Access Token
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <LinkIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Links</p>
                <p className="text-2xl font-bold text-foreground">{adminTokens.length}</p>
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
                  {adminTokens.filter(t => getStatus(t).label === 'Active').length}
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
            Access Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : accessLinks.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No access tokens generated yet. Click "Generate Access Token" to create one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Access Token</TableHead>
                  <TableHead className="text-muted-foreground">Expires At</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminTokens.map((token) => {
                  const status = getStatus(token);
                  return (
                    <TableRow key={token.id} className="border-border hover:bg-muted/50">
                      <TableCell className="font-mono text-xs text-foreground">
                        <div className="flex items-center gap-2">
                          <span className="max-w-[200px] truncate">
                            {token.access_token}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(token.access_token)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        <div className="flex items-center gap-1">
                          <Timer className="h-4 w-4 text-muted-foreground" />
                          <span>{getTimeRemaining(token.expires_at)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>
                          {status.label === 'Active' && <CheckCircle className="mr-1 h-3 w-3" />}
                          {status.label === 'Used' && <XCircle className="mr-1 h-3 w-3" />}
                          {status.label === 'Expired' && <Clock className="mr-1 h-3 w-3" />}
                          {status.label}
                        </Badge>
                      </TableCell>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {status.label === 'Active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => revokeLinkMutation.mutate(token.id)}
                              className="border-destructive/50 text-destructive hover:bg-destructive/10"
                            >
                              Revoke
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => deleteLinkMutation.mutate(token.id)}
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
            {generatedLink ? 'Token Generated!' : 'Generate Access Token'}
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
                  <span className="text-muted-foreground">Access Token:</span>
                  <span className="text-foreground font-mono text-xs">
                    {generatedTokenData?.access_token}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Expiration:</span>
                  <span className="text-foreground">
                    {getTimeRemaining(generatedTokenData?.expires_at || null)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline">
                    One-Time Use
                  </Badge>
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
              {/* Description */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">Generate Access Token</Label>
                <p className="text-sm text-muted-foreground">
                  Generate a one-time use access token that expires in 1 hour. 
                  This token can be used to access the admin panel.
                </p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGenerate} disabled={createLinkMutation.isPending}>
                  {createLinkMutation.isPending ? 'Generating...' : 'Generate Token'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
