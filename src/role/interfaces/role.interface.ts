import { IApiResponse } from "@/common/interceptors/transform.interceptor";
import { PaginatedResult } from "@/common/pagination/pagination.interface";
import { GetRolesQueryDto } from "@/role/dto/GetRolesQueryDto.dto";

export interface ICreateRoleDto {
    roleName: string;
    description?: string;
}


export interface IRoleEntity {
    id: string;
    roleName: string;
    description?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

// Interface Controller
export interface IRoleController {
    create(createRoleDto: ICreateRoleDto): Promise<IApiResponse<IRoleEntity>>;
    findAll(query: GetRolesQueryDto): Promise<IApiResponse<PaginatedResult<IRoleEntity>>>;
    findOne(id: string): Promise<IApiResponse<IRoleEntity | null>>;
    update(id: string, updateRoleDto: Partial<ICreateRoleDto>): Promise<IApiResponse<IRoleEntity | null>>;
    remove(id: string): Promise<IApiResponse<IRoleEntity | null>>;
}

// Interface Service
export interface IRoleService {
    findRoleIdByName(roleNameOrId: string): Promise<string | null>;
    create(createRoleDto: ICreateRoleDto): Promise<IRoleEntity>;
    findAll(query: GetRolesQueryDto): Promise<PaginatedResult<IRoleEntity>>;
    findOne(id: string): Promise<IRoleEntity | null>;
    update(id: string, updateRoleDto: Partial<ICreateRoleDto>): Promise<IRoleEntity | null>;
    remove(id: string): Promise<IRoleEntity | null>;
}