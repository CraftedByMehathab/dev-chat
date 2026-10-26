export const dashboardPath = () => "/dashboard";
export const homePath = () => "/";
export const chatsPath = (threadId?: string) =>
  `/chat${threadId ? `/${threadId}` : ""}`;
