export const useGroups = () => (
  class GroupsService {
    async getGroups  ({
      id,
      name,
      manager,
      code,
      parent,
      limit = 10,
      offset = 0
    }: {
      id?: number,
      name?: string,
      manager?: string,
      code?: string,
      parent?: string,
      limit?: number,
      offset?: number
    }) {
      try {
        loadingGroup.value = true;
        const { data, error } = await useFetch<{ total: number, rows: Group[] }>('/groups',
          {
            params: {
              ...(name != '' && !name && id && {
                id
              }),
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
          ElNotification({
            message: 'Error al obtener las marcas intente de nuevo mas tarde'
          })
        }
    
        loadingGroup.value = false;
        return data.value
      } catch (error) {
        loadingGroup.value = false;
        ElNotification({
          message: 'Error al obtener las marcas intente de nuevo mas tarde'
        })
      }
    }
  }
)