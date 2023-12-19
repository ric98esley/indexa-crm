export const useTypes = () => {
  return class TypesServices {
    async getTypes({
      name,
      status
    }: {
      name?: string,
      status?: string
    }) {
      try {
        const { data, error } = await useFetch<{ total: number, rows: Type[] }>('/locations/types',
          {
            params: {
              ...(name != '' && name && {
                name
              }),
              ...(status && {
                status
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
          title: 'Error al obtener los tipos intente de nuevo mas tarde',
          message: error?.message
        })
      }
    }
  }
}