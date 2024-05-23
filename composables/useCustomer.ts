export const useCustomer = () => {
  return class CustomerService {
    private URL = '/customers'
    async getCustomers({
      search,
      limit,
      offset
    }: {
      search: string,
      limit?: number,
      offset?: number,
    }) {
      try {
        const params = useFilterObject({
          search,
          ...(offset && {
            offset: (offset - 1) * Number(limit)
          }),
          ...(limit && {
            limit
          })
        })
        const { data, error } = await useApi<{ total: number, rows: Profile[] }>(this.URL,
          {
            params
          }
        );
        if (error.value) {
          throw new Error('Error al cargar los contactos')
        }

        if (!data.value) throw new Error()

        const toReturn = {
          rows: data.value.rows,
          total: data.value.total,
        }

        return toReturn
      } catch (error: any) {
        ElNotification({
          title: 'Error al obtener los contactos intente de nuevo mas tarde',
          message: error.message
        })
      }
    }
    async createCustomer({
      name,
      lastName,
      cardId,
      phone,
    }: Profile) {
      try {
        const body = useFilterObject({
          name,
          lastName,
          cardId,
          phone
        })
        const { data, error } = await useApi<Profile>(this.URL,
          {
            method: 'post',
            body
          }
        );
        if (error.value) {
          throw new Error(error.value.data.message);
        }

        ElNotification({
          title: 'Contacto creado correctamente',
          message: data.value?.name+ ' | ' + data.value?.phone,
          type: 'success'
        })
        return data
      } catch (error: any) {
        ElNotification({
          title: 'Error al obtener los contactos intente de nuevo mas tarde',
          message: error.message,
          type: 'error'
        })
      }
    }

    async getOneCustomer({ id }: { id: number }) {
      try {
        const { data, error } = await useApi<Profile>(`${this.URL}/${id}`);
        if (error.value) {
          throw new Error('Error al cargar el contacto')
        }

        if (!data.value) throw new Error()

        const toReturn = data.value

        return toReturn;
      } catch (error: any) {
        ElNotification({
          title: 'Ha ocurrido un error al cargar el contacto',
          message: error.message
        })
      }
    }
    async editCustomer({
      id,
      name,
      lastName,
      cardId,
      phone,
    }: Profile) {
      try {
        const body = useFilterObject({
          name,
          lastName,
          cardId,
          phone
        })
        const { data, error } = await useApi<Profile>(`${this.URL}/${id}`,
          {
            method: 'patch',
            body
          }
        );
        if (error.value) {
          throw new Error(error.value.data.message);
        }
        ElNotification({
          title: 'Contacto modificado correctamente',
          message: data.value?.name
        })

        return data
      } catch (error: any) {
        ElNotification({
          title: 'Error al obtener los contactos intente de nuevo mas tarde',
          message: error.message
        })
      }
    }
    async removeCustomer({
      id,
    }: Profile) {
      try {
        const { data, error } = await useApi<Profile>(`${this.URL}/${id}`,
          {
            method: 'delete',
          }
        );
        if (error.value) {
          throw new Error(error.value.data.message);
        }

        ElNotification({
          title: 'Contacto eliminado correctamente',
          message: data.value?.name
        })

        return data
      } catch (error: any) {
        ElNotification({
          title: 'Error al obtener los contactos intente de nuevo mas tarde',
          message: error.message
        })
      }
    }
  }
}