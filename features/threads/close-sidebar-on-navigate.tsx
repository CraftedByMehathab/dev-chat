"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";

/**
 * The sidebar lives in the layout, so it survives navigation. On mobile its
 * sheet would stay open over the page you just picked, so close it whenever
 * the path changes (a thread link or New chat's redirect).
 */
export function CloseSidebarOnNavigate() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  // An effect, not a render-time update: this state belongs to SidebarProvider,
  // and React forbids updating another component while rendering.
  // setOpenMobile is a stable useState setter, so this runs only on navigation.
  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  return null;
}
