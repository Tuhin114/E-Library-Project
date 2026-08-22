import SidebarNav from "./SidebarNav";

const Sidebar = () => {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border px-3 py-8 md:block">
      <SidebarNav />
    </aside>
  );
};

export default Sidebar;
