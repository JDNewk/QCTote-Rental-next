import "../globals.css";

export const metadata = {
  title: "Article Editor | QC Tote Rental",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100 text-slate-950">{children}</body>
    </html>
  );
}
