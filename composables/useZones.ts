export const useZones = () => {
  return class ZoneServices {
    async getZones({ name }: {
      name?: string
    }) {
      try {
        const { data, error } = await useFetch<{ total: number, rows: Zone[] }>('/locations/zones',
          {
            params: {
              ...(name != '' && name && {
                name
              })
            }
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
  }
}