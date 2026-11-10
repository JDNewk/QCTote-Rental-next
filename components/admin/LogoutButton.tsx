"use client";

export default function LogoutButton() {
  return (
    <form action="/api/admin/logout" method="post">
      <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-bold hover:border-lime-500">Sign out</button>
    </form>
  );
}
