import { Paginated, PaginationOptions, withDefaults } from "@/lib/types/Paginated"
import { IUser } from "@/lib/types/user/user.interface"
import { createAuthorizedNatsRequest } from "@/lib/utils/createNatsRequest"

export const getUsersByOrganization = async (options: PaginationOptions, filters?: any): Promise<Paginated<IUser>> => {
    options = withDefaults(options)
    return (await createAuthorizedNatsRequest("users.getByOrganization", { options, filters })) as Paginated<IUser>
}