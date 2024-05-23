export const useZones = () => {
  return class ZoneServices {
    private URL = '/locations/zones'
    async getZones({ name, limit = 50, offset }: {
      name?: string,
      limit?: number,
      offset?: number
    }) {
      try {
        const params = useFilterObject({
          name,
          limit,
          ...(offset && { offset: (offset - 1) * Number(limit) })
        })
        const { data, error } = await useApi<{ total: number, rows: Zone[] }>(this.URL,
          {
            params
          }
        );
        if (error.value) {
          throw new Error(error.value.data.message);
        }
        return data.value
      } catch (error: any) {
        ElNotification({
          title: 'Error al obtener las zonas intente de nuevo mas tarde',
          message: error.message,
          type: 'error'
        })
      }
    }
    async createZone({
      name
    }: {
      name: string
    }) {
      try {

        const { data, error } = await useApi<Zone>(this.URL,
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
      } catch (error : any) {
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

        const { data, error } = await useApi<Zone>(`${this.URL}/${id}`,
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
      } catch (error: any) {
        ElNotification({
          title: 'Error al modificar la zona intente de nuevo mas tarde',
          message: error.message
        })
      }
    }
    async removeZone(id: number) {
      try {
        const { data, error } = await useApi<Zone>(`${this.URL}/${id}`, {
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