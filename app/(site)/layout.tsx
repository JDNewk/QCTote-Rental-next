import "../globals.css";
import SiteBody from "@/components/SiteBody";
import { siteMetadata } from "@/config/siteMetadata";

export const metadata = siteMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <SiteBody>{children}</SiteBody>
    </html>
  );
}
