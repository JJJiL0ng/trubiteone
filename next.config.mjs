/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googleapis.com unpkg.com firestore.googleapis.com cdnjs.cloudflare.com; connect-src 'self' *.googleapis.com *.firebaseio.com; img-src 'self' data: *.googleapis.com *.gstatic.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com;"
            }
          ]
        }
      ];
    }
  };
  
  export default nextConfig;