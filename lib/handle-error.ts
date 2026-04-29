import { toast } from 'sonner';

interface BackendErrorDetail {
  field: string;
  messages: string[];
}

interface BackendErrorResponse {
  statusCode?: number;
  message?: string;
  details?: BackendErrorDetail[];
}

export function handleApiError(error: any): void {
  const responseData = error.response?.data as BackendErrorResponse | undefined;

  if (!responseData) {
    toast.error('Network error. Please try again.');
    return;
  }

  // Nếu có details (lỗi validation từng field)
  if (Array.isArray(responseData.details) && responseData.details.length > 0) {
    const errorLines = responseData.details.map((detail) => {
      const fieldLabel = detail.field;
      const messages = detail.messages.join(', ');
      return `${fieldLabel}: ${messages}`;
    });
    // Toast chấp nhận string, dùng \n để xuống dòng
    toast.error(errorLines.join('\n'));
  } else if (responseData.message) {
    // Lỗi chung (ví dụ "User already exists")
    toast.error(responseData.message);
  } else {
    toast.error('An unexpected error occurred.');
  }
}