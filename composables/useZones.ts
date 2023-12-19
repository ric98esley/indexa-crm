export const useZones = () => {
  return class ZoneServices {
    async getZones({ name, limit, offset }: {
      name?: string,
      limit: number,
      offset: number
    }) {
      try {
        const params = useFilterObject({
          name,
          limit,
          offset: (offset - 1) * Number(limit)
        })
        const { data, error } = await useFetch<{ total: number, rows: Zone[] }>('/locations/zones',
          {
            params
          }
        );
        if (error.value) {
          throw new Error(error.value.data.message);
        }
        return data.value
      } catch (error) {
        ElNotification({
          title: 'Error al obtener las zonas intente de nuevo mas tarde',
          message: error.message
        })
      }
    }
    async createZone({
      name
    }: {
      name: string
    }) {
      try {

        const { data, error } = await useFetch<Zone>('/locations/zones',
          {
            method: 'post',
            body: {
              name,
            }
          },
        )

        if (error.value && error.value.statusCode && error.value.statusCode >= 400) {
          throw new Error(error.value.data.message)
        }
        ElNotification({
          title: 'Zona creada correctamente',
          message: `${data.value?.name}`
        })
        return data.value
      } catch (error) {
        ElNotification({
          title: 'Error al crear zona intente de nuevo mas tarde',
          message: error.value
        })
      }
    }

    async patchZone({ id, name }: { id?: number, name: string }) {
      try {

        const body = {
          name,
        }

        const { data, error } = await useFetch<Zone>(`/locations/zones/${id}`,
          {
            method: 'PATCH',
            body
          }
        );

        if (error.value) {
          throw new Error(error.value.data.message)
        }

        ElNotification({
          title: 'Zona modificada correctamente',
          message: `${data.value?.name}`
        })

        return data.value
      } catch (error) {
        ElNotification({
          title: 'Error al modificar la zona intente de nuevo mas tarde',
          message: error.message
        })
      }
    }
    async removeZone(id: number) {
      try {
        const { data, error } = await useFetch<Zone>(`/locations/zones/${id}`, {
          method: 'delete'
        })

        if (error.value) {
          throw new Error(error.value.data.message)
        }

        ElNotification({
          title: 'La zona ha sido borrada.'
        })
      } catch (error) {
        ElNotification({
          message: 'Error al borrar la zona intente de nuevo mas tarde.'
        })
      }
    }
  }
}