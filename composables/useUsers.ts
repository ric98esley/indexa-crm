const isObjectEmpty = (objectName: { [key: string]: any }) => {
  return Object.keys(objectName).length === 0
}
export const useUsers = () => {
  return class UsersService {
    private URL = '/users'
    async getUsers({
      username,
      group,
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
      group?: string,
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
        const { data, error } = await useApi<{ total: number, rows: User[] }>(this.URL,
          {
            params: {
              ...(username != '' && username && {
                username
              }),
              ...(name != '' && name && {
                name
              }),
              ...(group != '' && group && {
                group
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

    async getUser(id: number) {
      const { data, error } = await useApi<User>(`${this.URL}/${id}`);
      if (error.value) {
        throw createError('Error al cargar el usuario')
      }
      return data.value
    }

    async createUser(user: CreateUser) {
      const body = useFilterObject(user);
      const profile = useFilterObject(user.profile);
      body.profile = profile
      if (isObjectEmpty(body.profile)) {
        delete body.profile
      }

      const { data, error } = await useApi<User>(this.URL,
        {
          method: 'POST',
          body: {
            ...body,
          }
        },
      )
      if (error.value) {
        throw createError({
          message: 'Error al crear el usuario',
          statusCode: error.value.statusCode
        })
      }

      ElNotification({
        title: 'Usuario creada correctamente',
        message: `${data.value?.username}`
      })
      return data.value
    }
    async editUser(id: number, changes: CreateUser) {
      try {

        const body = useFilterObject(changes);
        const profile = useFilterObject(changes.profile);
        body.profile = profile
        if (isObjectEmpty(body.profile)) {
          delete body.profile
        }

        const { data, error } = await useApi<User>(`${this.URL}/${id}`,
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
      } catch (error: any) {
        ElNotification({
          title: 'Error al editar usuario intente de nuevo mas tarde',
          message: error.message,
        })
      }
    }
    async removeUser({ id }: { id: number }) {
      try {
        const { data, error } = await useApi<User>(`${this.URL}/${id}`, {
          method: 'delete'
        })

        if (error.value) {
          throw new Error(error.value.data.message);
        }

        ElNotification({
          message: 'El usuario ha sido borrada.'
        })
      } catch (error: any) {
        ElNotification({
          title: 'Error al borrar el usuario intente de nuevo mas tarde.',
          message: error.message
        })
      }
    }
  }
}