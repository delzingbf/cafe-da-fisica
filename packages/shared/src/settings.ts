export interface SettingsResponse {
    orderNotificationEmail: string | null;
}

export interface UpdateOrderNotificationEmailRequest {
    email: string;
}

export interface UpdateOrderNotificationEmailResponse {
    confirmationEmailSent: boolean;
}

export interface ChangeAdminPasswordRequest {
    currentPassword: string;
    newPassword: string;
}
