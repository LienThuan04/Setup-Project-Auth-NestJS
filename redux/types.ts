export type User = {
    id: string;
    email: string;
    avatarUrl?: string | null;
    backgroundUrl?: string | null;
    description?: string | null;
    userName: string;
    accountType: string;
    roleId: string;
    roleName: string;
}
