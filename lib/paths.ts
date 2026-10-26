export const dashboardPath = () => "/dashboard";
export const homePath = () => "/";
export const chatsPath = () => "/chat";
export const chatPath = (threadId: string) => `${chatsPath()}/${threadId}`;
