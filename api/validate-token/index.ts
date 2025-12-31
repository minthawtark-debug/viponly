import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export default async function handler(req: Request) {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response(JSON.stringify({ error: 'Access token is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Fetch the token from the database
    const { data: tokenData, error } = await supabase
      .from('admin_tokens')
      .select('*')
      .eq('access_token', token)
      .maybeSingle();

    if (error) {
      console.error('Error fetching token:', error);
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!tokenData) {
      return new Response(JSON.stringify({ error: 'Invalid access token' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if token is already used
    if (tokenData.used) {
      return new Response(JSON.stringify({ error: 'Access token has already been used' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if token has expired
    if (tokenData.expires_at) {
      const expiryDate = new Date(tokenData.expires_at);
      if (expiryDate < new Date()) {
        return new Response(JSON.stringify({ error: 'Access token has expired' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Mark token as used (one-time use)
    const { error: updateError } = await supabase
      .from('admin_tokens')
      .update({ used: true })
      .eq('id', tokenData.id);

    if (updateError) {
      console.error('Error updating token:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to validate token' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Token is valid
    return new Response(JSON.stringify({
      valid: true,
      message: 'Access token is valid'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Access token is required' });
  }

  try {
    // Fetch the token from the database
    const { data: tokenData, error } = await supabase
      .from('admin_tokens')
      .select('*')
      .eq('access_token', token)
      .maybeSingle();

    if (error) {
      console.error('Error fetching token:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!tokenData) {
      return res.status(404).json({ error: 'Invalid access token' });
    }

    // Check if token is already used
    if (tokenData.used) {
      return res.status(403).json({ error: 'Access token has already been used' });
    }

    // Check if token has expired
    if (tokenData.expires_at) {
      const expiryDate = new Date(tokenData.expires_at);
      if (expiryDate < new Date()) {
        return res.status(403).json({ error: 'Access token has expired' });
      }
    }

    // Mark token as used (one-time use)
    const { error: updateError } = await supabase
      .from('admin_tokens')
      .update({ used: true })
      .eq('id', tokenData.id);

    if (updateError) {
      console.error('Error updating token:', updateError);
      return res.status(500).json({ error: 'Failed to validate token' });
    }

    // Token is valid
    res.status(200).json({
      valid: true,
      message: 'Access token is valid'
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}