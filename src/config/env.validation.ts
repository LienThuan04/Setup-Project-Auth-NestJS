import { plainToInstance, Type } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, validateSync } from "class-validator";

enum AppMode {
    Development = 'development',
    Production = 'production'
}

class EnvironmentVariables {
    @IsEnum(AppMode, { message: 'MODE must be either "development" or "production"' })
    MODE!: AppMode;

    @Type(() => Number)
    @IsInt({ message: 'PORT must be an integer' })
    @IsOptional({ message: 'PORT is optional, but if provided, it must be an integer' })
    PORT!: number;

    @IsString({ message: 'DATABASE_URL is String' })
    @IsNotEmpty({ message: 'DATABASE_URL is required' })
    DATABASE_URL!: string;

    @IsString({ message: 'JWT_ACCESS_TOKEN_SECRET is String' })
    @IsNotEmpty({ message: 'JWT_ACCESS_TOKEN_SECRET is required' })
    JWT_ACCESS_TOKEN_SECRET!: string;

    @IsString({ message: 'JWT_REFRESH_TOKEN_SECRET is String' })
    @IsNotEmpty({ message: 'JWT_REFRESH_TOKEN_SECRET is required' })
    JWT_REFRESH_TOKEN_SECRET!: string;

    @IsString({ message: 'JWT_PASSWORD_RESET_SECRET is String' })
    @IsNotEmpty({ message: 'JWT_PASSWORD_RESET_SECRET is required' })
    JWT_PASSWORD_RESET_SECRET!: string;

    @IsUrl({ require_tld: false })
    URL_CLIENT!: string;

    @IsString({ message: 'UPSTASH_REDIS_REST_URL is String' })
    @IsNotEmpty({ message: 'UPSTASH_REDIS_REST_URL is required' })
    UPSTASH_REDIS_REST_URL!: string;

    @IsString({ message: 'UPSTASH_REDIS_REST_TOKEN is String' })
    @IsNotEmpty({ message: 'UPSTASH_REDIS_REST_TOKEN is required' })
    UPSTASH_REDIS_REST_TOKEN!: string;

    @IsString({ message: 'EMAIL_HOST is String' })
    @IsNotEmpty({ message: 'EMAIL_HOST is required' })
    EMAIL_HOST!: string;

    @IsString({ message: 'EMAIL_AUTH_USER is String' })
    @IsNotEmpty({ message: 'EMAIL_AUTH_USER is required' })
    EMAIL_AUTH_USER!: string;

    @IsString({ message: 'EMAIL_AUTH_PASS is String' })
    @IsNotEmpty({ message: 'EMAIL_AUTH_PASS is required' })
    EMAIL_AUTH_PASS!: string;

    @IsString({ message: 'GOOGLE_CLIENT_ID is String' })
    @IsNotEmpty({ message: 'GOOGLE_CLIENT_ID is required' })
    GOOGLE_CLIENT_ID!: string;

    @IsString({ message: 'GOOGLE_CLIENT_SECRET is String' })
    @IsNotEmpty({ message: 'GOOGLE_CLIENT_SECRET is required' })
    GOOGLE_CLIENT_SECRET!: string;

    @IsString({ message: 'GOOGLE_CALLBACK_URL is String' })
    @IsNotEmpty({ message: 'GOOGLE_CALLBACK_URL is required' })
    GOOGLE_CALLBACK_URL!: string;

    @IsString({ message: 'SUPABASE_URL is String' })
    @IsNotEmpty({ message: 'SUPABASE_URL is required' })
    SUPABASE_URL!: string;

    @IsString({ message: 'SUPABASE_KEY is String' })
    @IsNotEmpty({ message: 'SUPABASE_KEY is required' })
    SUPABASE_KEY!: string;
}

export const validateEnv = (config: Record<string, unknown>) => {
    /*plainToInstance là một hàm trong thư viện class-transformer, được sử dụng để chuyển đổi một đối tượng JavaScript thông thường (plain object) thành một instance của một lớp (class instance).
    Nó cho phép bạn tạo ra các instance của lớp từ các đối tượng thông thường, đồng thời áp dụng các decorator và các tính năng khác của class-transformer để thực hiện việc chuyển đổi dữ liệu một cách linh hoạt.*/
    const Validated_Config = plainToInstance(EnvironmentVariables, config, { enableImplicitConversion: true });
    /*enableImplicitConversion là một tùy chọn trong class-transformer
     cho phép tự động chuyển đổi các giá trị từ kiểu dữ liệu này sang kiểu dữ liệu khác dựa trên các decorator đã được định nghĩa trong lớp.
     Khi enableImplicitConversion được đặt thành true, 
     class-transformer sẽ cố gắng chuyển đổi các giá trị đầu vào sang các kiểu dữ liệu tương ứng mà bạn đã chỉ định trong lớp của mình, 
     ngay cả khi không có decorator cụ thể nào được sử dụng để chỉ định kiểu dữ liệu đó.*/
     const errors = validateSync(Validated_Config, { skipMissingProperties: false });
     /*validateSync là một hàm trong thư viện class-validator, được sử dụng để thực hiện việc xác thực (validation) các đối tượng dựa trên các decorator đã được định nghĩa trong lớp.
     Nó kiểm tra các thuộc tính của đối tượng và xác minh xem chúng có tuân thủ các quy tắc xác thực đã được chỉ định hay không. 
     Nếu có lỗi xác thực, validateSync sẽ trả về một mảng chứa các lỗi, mỗi lỗi đại diện cho một thuộc tính không hợp lệ và thông tin chi tiết về lỗi đó.*/
    if (errors.length > 0) {
        const errorMessages = errors.map((error) => ({
            field: error.property,
            messages: Object.values(error.constraints || {}),
        }));
        throw new Error(`Environment validation failed: ${JSON.stringify(errorMessages)}`);
    }
    return Validated_Config;

}