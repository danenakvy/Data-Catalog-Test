import React from "react";
import { NavLink } from "react-router-dom";
import { Compass, ShieldCheck, Users, DatabaseZap, PlusCircle, History, Inbox } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useAccessRequests } from "@/hooks/use-access-requests";
export function AppSidebar(): JSX.Element {
  const user = useAuthStore(state => state.user);
  const { data: requests } = useAccessRequests();
  const pendingCount = requests?.length || 0;
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
      isActive && "bg-muted text-primary"
    );
  return (
    <Sidebar>
      <SidebarHeader>
        <NavLink to="/" className="flex items-center gap-2 px-2 py-1">
          <DatabaseZap className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">Nexus Catalog</span>
        </NavLink>
      </SidebarHeader>
      <SidebarContent className="flex-1">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <NavLink to="/" end className={navLinkClass}>
                <Compass className="h-4 w-4" />
                <span>Catalog</span>
              </NavLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <NavLink to="/my-requests" className={navLinkClass}>
                <Inbox className="h-4 w-4" />
                <span>My Requests</span>
              </NavLink>
            </SidebarMenuItem>
            {(user?.role === 'Data Owner' || user?.role === 'Admin') && (
              <>
                <SidebarMenuItem>
                  <NavLink to="/access-management" className={navLinkClass}>
                    <ShieldCheck className="h-4 w-4" />
                    <span className="flex-1">Access Management</span>
                    {pendingCount > 0 && (
                      <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">{pendingCount}</Badge>
                    )}
                  </NavLink>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <NavLink to="/audit-log" className={navLinkClass}>
                    <History className="h-4 w-4" />
                    <span>Audit Log</span>
                  </NavLink>
                </SidebarMenuItem>
              </>
            )}
            {user?.role === 'Admin' && (
              <SidebarMenuItem>
                <NavLink to="/user-management" className={navLinkClass}>
                  <Users className="h-4 w-4" />
                  <span>User Management</span>
                </NavLink>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {(user?.role === 'Data Owner' || user?.role === 'Contributor') && (
          <div className="p-2">
            <NavLink to="/datasets/new">
              <SidebarMenuButton className="w-full">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Dataset
              </SidebarMenuButton>
            </NavLink>
          </div>
        )}
        <div className="px-4 pb-2 text-xs text-muted-foreground text-center">Built with ���️ at DCx</div>
      </SidebarFooter>
    </Sidebar>
  );
}