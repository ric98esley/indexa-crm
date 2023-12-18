const isObjectEmpty = (objectName) => {
  return Object.keys(objectName).length === 0
}
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

        if (!data.value) throw new Error()

        return data.value
      } catch (error) {
        ElNotification({
          message: 'Error al obtener las usuario intente de nuevo mas tarde'
        })
      }
    }

    async createUser(user: {
      username: string,
      email: string,
      role: string,
      password: string,
      isActive?: false,
      groupId?: number,
      profile?: {
        name: string,
        lastName: string,
        cardId: string,
        phone: string,
      }
    }) {
      try {
        const body = useFilterObject(user);
        body.profile = useFilterObject(user.profile)

        if (isObjectEmpty(body.profile)) delete body.profile;
        const { data, error } = await useFetch<User>('/users',
          {
            method: 'POST',
            body
          },
        )
        if (error.value) {
          console.log(error)
          throw new Error(error.value.data.message)
        }
        ElNotification({
          title: 'Usuario creada correctamente',
          message: `${data.value?.username}`
        })
        return { data, error }
      } catch (error) {
        ElNotification({
          title: 'Error al crear usuario intente de nuevo mas tarde',
          message: error.message
        })
      }
    }
    async editUser({
      id,
      username,
      email,
      role,
      isActive,
      groupId,
    }: {
      email?: string,
      role?: string,
      isActive?: false,
      groupId?: number,
      id: number
    },
     ) {
      try {
        const body = {
          email,
          role,
          isActive,
          groupId
        };
        const { data, error } = await useFetch<User>(`/users/${id}`,
          {
            method: 'patch',
            body
          },
        );
        if (error.value) {
          throw new Error(error.value.data.message)
        }
        ElNotification({
          title: 'Usuario editado correctamente',
          message: `${data.value?.username}`
        })
        return { data, error }
      } catch (error) {
        ElNotification({
          title: 'Error al editar usuario intente de nuevo mas tarde',
          message: error.message,
        })
      }
    }
    async removeUser ({ id }: { id: number }) {
      try {
        const { data, error } = await useFetch<User>(`/users/${id}`, {
          method: 'delete'
        })

        if (error.value) {
          throw new Error(error.value.data.message);
        }

        ElNotification({
          message: 'El usuario ha sido borrada.'
        })
      } catch (error) {
        ElNotification({
          title: 'Error al borrar el usuario intente de nuevo mas tarde.',
          message: error.message
        })
      }
    }
  }
}