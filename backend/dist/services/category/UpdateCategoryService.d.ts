interface UpdateCategoryServiceProps {
    id: string;
    name: string;
}
declare class UpdateCategoryService {
    execute({ id, name }: UpdateCategoryServiceProps): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
    }>;
}
export { UpdateCategoryService };
//# sourceMappingURL=UpdateCategoryService.d.ts.map