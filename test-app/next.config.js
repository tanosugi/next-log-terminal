/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_LOG_TIMESTAMP: 'true',
    NEXT_PUBLIC_LOG_FILENAME: 'true',
    NEXT_PUBLIC_LOG_LINENUMBER: 'true',
    NEXT_PUBLIC_LOG_COLORS: 'true',
    NEXT_PUBLIC_LOG_LEVEL: 'debug',
    NEXT_PUBLIC_LOG_API_ENDPOINT: '/api/log-terminal',
  },
};

export default nextConfig;
