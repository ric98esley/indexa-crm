export const useGroups = () => (
  class GroupsService {
    async getGroups({
      name,
      manager,
      code,
      parent,
      limit = 10,
      offset = 0
    }: {
      name?: string,
      manager?: string,
      code?: string,
      parent?: string,
      limit?: number,
      offset?: number
    }) {
      try {
        const { data, error } = await useFetch<{ total: number, rows: Group[] }>('/groups',
          {
            params: {
              ...(name != '' && name && {
                name
              }),
              ...(code != '' && code && {
                code
              }),
              ...(parent != '' && parent && {
                parent
              }),
              ...(manager != '' && manager && {
                manager
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
          throw new Error(error.value.data.message);
        }
        return data.value
      } catch (error) {
        ElNotification({
          title: 'Error al obtener las marcas intente de nuevo mas tarde',
          message: error.message
        })
      }
    }
  }
)