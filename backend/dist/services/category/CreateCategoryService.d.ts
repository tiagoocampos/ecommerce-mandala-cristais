interface CreateCategoryProps {
    name: string;
}
declare class CreateCategoryService {
    execute({ name }: CreateCategoryProps): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        slug: string;
    }>;
}
export { CreateCategoryService };
//# sourceMappingURL=CreateCategoryService.d.ts.map