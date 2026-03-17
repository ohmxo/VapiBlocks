import { Sidebar } from "@/components/sidebar";
import "@/app/mdx.css";

export default function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex w-full h-auto flex-1 items-start px-6 md:grid md:grid-cols-[180px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10 lg:px-10">
      <Sidebar />
      {children}
    </div>
  );
}
