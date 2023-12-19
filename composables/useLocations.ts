class LocationsService {
  async getLocations({
    status,
    search,
    name,
    code,
    group,
    manager,
    groupId,
    type,
    rif,
    address,
    order,
    sort,
    endDate,
    startDate,
    limit = 10,
    offset = 0
  }: {
    status?: string[],
    search?: string,
    name?: string,
    code?: string,
    group?: string,
    groupId?: number,
    manager?: string,
    type?: string,
    rif?: string,
    address?: string,
    order?: string,
    sort?: string,
    endDate?: string,
    startDate?: string,
    limit?: number,
    offset?: number
  }) {
    try {
      const { data, error } = await useFetch<{ total: number, rows: Place[] }>('/locations',
        {
          params: {
            ...(status && status?.length > 0 && {
              status: status.join(',')
            }),
            ...(search && search != '' && {
              search
            }),
            ...(name != '' && name && {
              name
            }),
            ...(code != '' && code && {
              code
            }),
            ...(group != '' && group && {
              group
            }),
            ...(groupId && {
              groupId
            }),
            ...(manager != '' && manager && {
              manager
            }),
            ...(type != '' && type && {
              type
            }),
            ...(rif != '' && rif && {
              rif
            }),
            ...(address != '' && address && {
              address
            }),
            ...(order != '' && order && {
              order
            }),
            ...(sort != '' && sort && {
              sort
            }),
            ...(endDate != '' && endDate && {
              endDate
            }),
            ...(startDate != '' && startDate && {
              startDate
            }),
            ...(offset && {
              offset: (offset - 1) * limit
            }),
            ...(limit && {
              limit
            })
          }
        }
      );
      if (error.value) {
        throw new Error(error.value.data.message)
      }
      return { data, error }
    } catch (error) {
      ElNotification({
        title: 'Error al obtener las agencia intente de nuevo mas tarde',
        message: error.message,
      })
    }
  }

  async createLocation({
    code,
    isActive,
    name,
    zoneId,
    phone,
    typeId,
    groupId,
    managerId,
    rif,
    address,
  }: {
    code: string,
    name: string,
    typeId: number,
    zoneId: number,
    groupId: number,
    isActive?: boolean,
    phone?: string,
    rif?: string,
    address?: string,
    managerId?: number
  }) {
    try {

      const body = useFilterObject({
        code,
        isActive,
        name,
        zoneId,
        phone,
        typeId,
        groupId,
        managerId,
        rif,
        address,
      });

      const { data, error } = await useFetch<Place>('/locations',
        {
          method: 'POST',
          body
        },
      )

      if (error.value && error.value.statusCode && error.value.statusCode >= 400) {
        throw new Error(error.value.data.message);
      }
      ElNotification({
        title: 'Agencia creada correctamente',
        message: `${data.value?.name}`
      })
      return { data, error }
    } catch (error) {
      ElNotification({
        title: 'Error al crear agencia intente de nuevo mas tarde',
        message: error.message,
        type: 'error'
      })
    }
  }

  async removePlace(id: number) {
    try {
      const { data, error } = await useFetch<Place>(`/locations/${id}`, {
        method: 'delete'
      })

      if (error.value) {
        throw new Error(error.value.data.message)
      }

      ElNotification({
        message: 'la agencia ha sido borrada.'
      })

      return data.value
    } catch (error) {
      ElNotification({
        title: 'Error al borrar la agencia intente de nuevo mas tarde.',
        message: error.me
      })
    }
  }

  async patchPlace({
    id,
    code,
    name,
    isActive,
    typeId,
    groupId,
    phone,
    rif,
    managerId,
    zoneId,
    address,
  }: {
    id: number,
    code?: string,
    name?: string,
    isActive?: string | number | boolean,
    typeId?: number,
    groupId?: number,
    phone?: string,
    rif?: string,
    managerId?: number,
    zoneId?: number,
    address?: string,
  }) {
    try {

      const body = useFilterObject({
        code,
        name,
        isActive,
        typeId,
        groupId,
        phone,
        rif,
        managerId,
        zoneId,
        address,
      });

      const { data, error } = await useFetch<Place>(`/locations/${id}`,
        {
          method: 'PATCH',
          body
        }
      );

      if (error.value) {
        throw new Error(error.value.data.message);
      }

      ElNotification({
        title: 'Agencia modificada correctamente',
        message: `${data.value?.name}`
      })

      return data.value
    } catch (error) {
      ElNotification({
        title: 'Error al modificar el agencia intente de nuevo mas tarde',
        message: error.message
      })
    }
  }
}

export const useLocation = () => {
  return LocationsService
}