"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";

/**
 * The sidebar lives in the layout, so it survives navigation. On mobile its
 * sheet would stay open over the page you just picked, so close it whenever
 * the path changes (a thread link or New chat's redirect).
 */
export function CloseSidebarOnNavigate() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const [lastPathname, setLastPathname] = useState(pathname);

  // Adjusting state during render instead of in an effect, per React docs
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpenMobile(false);
  }

  return null;
}
