import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";
import { isAdmin } from "@/lib/adminAuth";

export const instant = false;

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6 py-16">
      <div className="w-full rounded-2xl bg-white p-8 shadow-lg">
        <p className="font-bold uppercase tracking-widest text-lime-600">QC Tote Rental</p>
        <h1 className="mt-2 text-3xl font-black">Private article editor</h1>
        <p className="mt-3 text-slate-600">Sign in with the article-editor password.</p>
        <LoginForm />
      </div>
    </main>
  );
}
