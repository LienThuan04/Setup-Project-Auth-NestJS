import { ApiProperty } from "@nestjs/swagger/dist/decorators/api-property.decorator";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { I } from "node_modules/@upstash/redis/error-8y4qG0W2";

export class PaginationQueryDto {
    @ApiProperty({ description: 'The page number', example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Page must be an integer' })
    @Min(1, { message: 'Page must be a positive integer' })
    page?: number = 1;

    @ApiProperty({ description: 'The number of items per page', example: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Limit must be an integer' })
    @Min(1, { message: 'Limit must be a positive integer' })
    @Max(100, { message: 'Limit must not exceed 100' })
    limit?: number = 10;

    @ApiProperty({ description: 'The field to sort by', example: 'createdAt' })
    @IsOptional()
    @IsString({ message: 'sortBy must be a string' })
    @IsIn(['createdAt', 'email', 'userName', 'roleName', 'description', 'id', 'updatedAt'],
        { message: 'sortBy must be one of "createdAt", "email", "userName", "roleName", "description", "id" or "updatedAt"' }
    )
    sortBy?: string = 'createdAt';

    @ApiProperty({ description: 'The sort order', example: 'desc', enum: ['asc', 'desc'] })
    @IsOptional()
    @IsIn(['asc', 'desc'], { message: 'order must be either "asc" or "desc"' })
    order?: 'asc' | 'desc' = 'desc';
}
