/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['lh3.googleusercontent.com', 'firebasestorage.googleapis.com'],
    },
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: "default-src * 'self' data: 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com https://*.gstatic.com https://*.firebase.com https://*.firebaseio.com https://*.firestore.googleapis.com"
            }
          ]
        }
      ];
    }
  };
  
  export default nextConfig;