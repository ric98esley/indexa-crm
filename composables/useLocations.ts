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
        title:'Error al obtener las agencia intente de nuevo mas tarde',
        message: error.message,
      })
    }
  }

  async createLocation(place) {
    try {

      const body = useFilterObject(place);

      const { data, error } = await useFetch<Place>('/locations',
        {
          method: 'POST',
          body
        },
      )

      if (error.value && error.value.statusCode && error.value.statusCode >= 400) {
        ElNotification({
          title: 'Error al crear agencia intente de nuevo mas tarde',
          message: error.value?.data.message,
        })
        return
      }
      ElNotification({
        title: 'Agencia creada correctamente',
        message: `${data.value?.name}`
      })
      return { data, error }
    } catch (error) {
      ElNotification({
        title: 'Error al crear agencia intente de nuevo mas tarde',
      })
    }
  }
}

export const useLocation = () => {
  return LocationsService
}