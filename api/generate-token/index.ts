export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Generate a random access token
    const accessToken = crypto.randomUUID();

    // Calculate expiration time (1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Insert the token into the database
    const { data, error } = await supabase
      .from('admin_tokens')
      .insert({
        access_token: accessToken,
        expires_at: expiresAt.toISOString(),
        used: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating token:', error);
      return new Response(JSON.stringify({ error: 'Failed to create access token' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate the access link
    const baseUrl = process.env.VITE_NEXT_PUBLIC_SITE_URL || 'https://viponly.vercel.app';
    const accessLink = `${baseUrl}/access?token=${accessToken}`;

    return new Response(JSON.stringify({
      success: true,
      accessLink,
      token: accessToken,
      expiresAt: expiresAt.toISOString()
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