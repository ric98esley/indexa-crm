export const useTypes = () => {
  return class TypesServices {
    async getTypes({
      name,
      status
    }: {
      name?: string,
      status?: string[]
    }) {
      try {
        const { data, error } = await useFetch<{ total: number, rows: Type[] }>('/locations/types',
          {
            params: {
              ...(name != '' && name && {
                name
              }),
              ...(status && {
                status: status.join(',')
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
    async getType(id: number) {
      try {
        const { data, error } = await useFetch<Type>(`/locations/types/${id}`);
        if (error.value) {
          throw new Error(error.value.data.message);
        }
        return data.value
      } catch (error) {
        ElNotification({
          title: 'Error al obtener el tipo intente de nuevo mas tarde',
          message: error?.message
        })
      }
    }
    async createType(type: Type) {
      try {
        const { data, error } = await useFetch<Type>('/locations/types', {
          method: 'POST',
          body: type
        });
        if (error.value) {
          throw new Error(error.value.data.message);
        }
        return data.value
      } catch (error) {
        ElNotification({
          title: 'Error al crear el tipo intente de nuevo mas tarde',
          message: error?.message
        })
      }
    }
    async updateType(type: Type) {
      try {
        const { data, error } = await useFetch<Type>(`/locations/types/${type.id}`, {
          method: 'PUT',
          body: type
        });
        if (error.value) {
          throw new Error(error.value.data.message);
        }
        return data.value
      } catch (error) {
        ElNotification({
          title: 'Error al actualizar el tipo intente de nuevo mas tarde',
          message: error?.message
        })
      }
    }
    async deleteType(id: number) {
      try {
        const { data, error } = await useFetch<Type>(`/locations/types/${id}`, {
          method: 'DELETE'
        });
        if (error.value) {
          throw new Error(error.value.data.message);
        }
        return data.value
      } catch (error) {
        ElNotification({
          title: 'Error al eliminar el tipo intente de nuevo mas tarde',
          message: error?.message
        })
      }
    }
  }
}