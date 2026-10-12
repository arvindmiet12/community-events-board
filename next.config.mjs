/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ["mssql", "msnodesqlv8"]
    }
};
export default nextConfig;
