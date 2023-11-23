export const useUsers = () => {
  return class UsersService {
    async getUsers({
      username,
      search,
      sort,
      order,
      cardId,
      name,
      phone,
      lastName,
      email,
      isActive,
      profile,
      role,
      all,
      limit,
      offset,
      startDate,
      endDate,
    }: {
      username?: string,
      search?: string,
      sort?: string,
      order?: string,
      cardId?: string,
      name?: string,
      phone?: string,
      lastName?: string,
      email?: string,
      isActive?: boolean,
      profile?: string,
      role?: string,
      all?: boolean,
      limit?: number,
      offset?: number,
      startDate?: string,
      endDate?: string,
    }) {
      try {
        const { data, error } = await useFetch<{ total: number, rows: User[] }>('/users',
          {
            params: {
              ...(username != '' && username && {
                username
              }),
              ...(name != '' && name && {
                name
              }),
              ...(lastName != '' && lastName && {
                lastName
              }),
              ...(phone != '' && phone && {
                phone
              }),
              ...(isActive != undefined && {
                isActive
              }),
              ...(profile != '' && profile && {
                profile
              }),
              ...(role != '' && role && {
                role
              }),
              ...(all != undefined && {
                all
              }),
              ...(sort != '' && sort && {
                sort
              }),
              ...(order != '' && order && {
                order
              }),
              ...(cardId != '' && cardId && {
                cardId
              }),
              ...(search != '' && search && {
                search
              }),
              ...(email != '' && email && {
                email
              }),
              ...(startDate != '' && startDate && {
                startDate
              }),
              ...(endDate != '' && endDate && {
                endDate
              }),
              ...(offset && {
                offset: (offset - 1) * Number(limit)
              }),
              ...(limit && {
                limit
              })
            }
          }
        );
        if (error.value) {
          throw new Error('Error al cargar los usuarios')
        }

        if(!data.value) throw new Error()

        return data.value
      } catch (error) {
        ElNotification({
          message: 'Error al obtener las usuario intente de nuevo mas tarde'
        })
      }
    }
  }
}