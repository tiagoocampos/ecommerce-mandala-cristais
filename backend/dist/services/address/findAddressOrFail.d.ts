interface findAddressOrFailProps {
    id: string;
    user_id: string;
}
export declare function findAddressOrFail({ id, user_id }: findAddressOrFailProps): Promise<{
    number: string;
    id: string;
    createdAt: Date;
    user_id: string;
    state: string;
    street: string;
    complement: string | null;
    neighborhood: string;
    city: string;
    zip_code: string;
}>;
export {};
//# sourceMappingURL=findAddressOrFail.d.ts.map