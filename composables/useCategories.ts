export const useCategories = () => {
  return class CategoriesService {
    async getCategories({
      name,
      offset,
      limit = 10,
      type
    }: {
      name?: string,
      offset?: number,
      limit?: number,
      type?: string
    }) {
      try {
        const { data, error } = await useFetch<{ total: number, rows: Category[] }>('/categories',
          {
            params: {
              ...(name && {
                name
              }),
              ...(offset && {
                offset: (offset - 1) * limit
              }),
              ...(limit && {
                limit: limit
              }),
              ...(type && type != '' && {
                type
              })
            }
          }
        );
        if (error.value) {
          ElNotification({
            message: 'Error al obtener las categorías intente de nuevo mas tarde'
          })
        }

        return { data, error }
      } catch (error) {
        ElNotification({
          message: 'Error al obtener las categorías intente de nuevo mas tarde'
        })
      }
    }

    async getCategory(id: number) {
      try {
        const { data, error } = await useFetch<Category>(`/categories/${id}`)

        if (error.value) {
          throw new Error()
        }

        return data.value
      } catch (error) {
        ElNotification({
          message: 'Error al obtener la categoría intente de nuevo mas tarde'
        })
      }
    }

    async createCategory({
      name,
      customFields,
      description,
      type,
    }: {
      name?: string,
      customFields?: number[],
      description?: string,
      type?: string
    }) {
      try {
        const { data, error } = await useFetch<Category>('/categories',
          {
            method: 'post',
            body: {
              name,
              customFields: customFields?.map((field) => {
                return { typeId: field }
              }),
              ...(description !== '' && {
                description
              }),
              ...(type !== '' && {
                type
              }),
            }
          },
        )

        if (error.value && error.value.statusCode && error.value.statusCode >= 400) {
          throw new Error()
        }
        ElNotification({
          title: 'Categoría creada correctamente',
          message: `${data.value?.name}`
        })
        return { data, error }
      } catch (error) {
        ElNotification({
          title: 'Error al crear categorías intente de nuevo mas tarde',
        })
      }
    }

    async patchCategory({
      id,
      name,
      customFields,
      removeFields,
      type,
      description
    }:
    {
      id?: number,
      name?: string,
      customFields?: number[],
      removeFields?: number[],
      type?: string,
      description?: string
    }) {
      try {
        const body = {
          name: name,
          customFields: customFields?.map((field) => {
            return { typeId: field }
          }),
          removeFields: removeFields?.map((field) => {
            return { typeId: field }
          }),
          type,
          description
        }

        const { data, error } = await useFetch<Category>(`/categories/${id}`,
          {
            method: 'PATCH',
            body
          }
        );

        if (error.value) {
          throw error
        }
        ElNotification({
          title: 'Categoría modificada correctamente',
          message: `${data.value?.name}`
        })

        return { data, error }
      } catch (error) {
        ElNotification({
          title: 'Error al modificar la categoría intente de nuevo mas tarde',
        })
        console.log(error)
      }
    }


    async removeCategory(id: number) {
      try {
        const { data, error } = await useFetch<Category>(`/categories/${id}`, {
          method: 'delete'
        })

        if (error.value) {
          throw new Error()
        }

        ElNotification({
          message: 'La categoría ha sido borrada.'
        })
        return { data, error }
      } catch (error) {
        ElNotification({
          message: 'Error al borrar la categoría intente de nuevo mas tarde.'
        })
      }
    }
  }
}