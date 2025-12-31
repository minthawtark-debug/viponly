import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import CrownIcon from '@/components/CrownIcon';
import { ShieldX, Clock, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';

type ValidationState = 'loading' | 'valid' | 'invalid' | 'used' | 'expired';

const AccessValidation = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [state, setState] = useState<ValidationState>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const validateAndRedirect = async () => {
      if (!token) {
        setState('invalid');
        setMessage('No access token provided.');
        return;
      }

      try {
        // Call the validation API
        const response = await fetch(`/api/validate-token?token=${encodeURIComponent(token)}`);
        const result = await response.json();

        if (!response.ok) {
          if (response.status === 403 && result.error === 'Access token has already been used') {
            setState('used');
            setMessage('This access link has already been used.');
            return;
          }
          if (response.status === 403 && result.error === 'Access token has expired') {
            setState('expired');
            setMessage('This access link has expired.');
            return;
          }
          setState('invalid');
          setMessage(result.error || 'Invalid access token.');
          return;
        }

        // Token is valid!
        setState('valid');

        // Store access in session storage
        sessionStorage.setItem('admin_access', 'true');
        sessionStorage.setItem('access_token', token);

        // Redirect after a brief success message
        setTimeout(() => {
          navigate('/admin');
        }, 1500);

      } catch (err) {
        console.error('Validation error:', err);
        setState('invalid');
        setMessage('An unexpected error occurred.');
      }
    };

    validateAndRedirect();
  }, [token, navigate]);

  const renderContent = () => {
    switch (state) {
      case 'loading':
        return (
          <div className="text-center animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-8 relative">
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
              <div className="relative flex items-center justify-center h-full">
                <CrownIcon className="h-12 w-12 text-primary animate-pulse" />
              </div>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Validating Access
            </h1>
            <p className="text-muted-foreground text-lg">
              Please wait while we verify your access link...
            </p>
          </div>
        );

      case 'valid':
        return (
          <div className="text-center animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Access Granted
            </h1>
            <p className="text-muted-foreground text-lg">
              Redirecting you to the exclusive content...
            </p>
            <div className="mt-6 flex justify-center">
              <div className="h-1 w-48 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary animate-[loading_1.5s_ease-in-out]" 
                  style={{ 
                    animation: 'loading 1.5s ease-in-out forwards',
                  }} 
                />
              </div>
            </div>
          </div>
        );

      case 'invalid':
        return (
          <div className="text-center animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center">
              <ShieldX className="h-12 w-12 text-destructive" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Invalid Link
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              {message}
            </p>
            <Link 
              to="/"
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-full bg-primary/10 border border-primary/30 text-primary font-medium transition-all hover:bg-primary/20 hover:border-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Return Home
            </Link>
          </div>
        );

      case 'used':
        return (
          <div className="text-center animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <AlertTriangle className="h-12 w-12 text-amber-500" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Link Already Used
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              {message}
            </p>
            <Link 
              to="/"
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-full bg-primary/10 border border-primary/30 text-primary font-medium transition-all hover:bg-primary/20 hover:border-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Return Home
            </Link>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-muted border border-border flex items-center justify-center">
              <Clock className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Link Expired
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              {message}
            </p>
            <Link 
              to="/"
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-full bg-primary/10 border border-primary/30 text-primary font-medium transition-all hover:bg-primary/20 hover:border-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Return Home
            </Link>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-radial">
      {/* Header */}
      <header className="border-b border-primary/20 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-center px-4 py-4">
          <Link to="/" className="flex items-center gap-2 group">
            <CrownIcon className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
            <span className="font-display text-xl font-bold text-gold-gradient">VIP CLUB</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[80vh]">
        {renderContent()}
      </main>

      {/* Loading animation keyframes */}
      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default AccessValidation;
