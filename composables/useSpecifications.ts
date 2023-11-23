export const useSpecifications = () => (
  class SpecificationsService {
    getSpecification = async ({
      name,
      offset,
      limit
    }: {
      name?: string,
      offset?: number,
      limit?: number
    }) => {
      try {
        const { data, error } = await useFetch<{ total: number, rows: Specification[] }>('/categories/specifications',
          {
            params: {
              ...(name != '' && name && {
                name
              }),
              ...(offset && {
                offset: (offset - 1) * Number(limit)
              }),
              ...(limit && {
                limit
              })
            }
          }
        );
        if (error.value) {
          ElNotification({
            message: 'Error al obtener las categorías intente de nuevo mas tarde'
          })
        }

        return data.value
      } catch (error) {
        ElNotification({
          message: 'Error al obtener las categorías intente de nuevo mas tarde'
        })
      }
    }

    createSpecification = async ({
      name
    }: {
      name: string
    }) => {
      try {
        const body = {
          name
        }
        const { data, error } = await useFetch<Specification>('/categories/specifications',
          {
            method: 'post',
            body
          }
        )
        if (error.value) throw error;
        ElNotification({
          title: 'Especificación creada correctamente',
        })
        return { data, error }
      } catch (error) {
        ElNotification({
          title: 'Error al crear especificación intente de nuevo mas tarde',
        })
      }
    }

    removeSpecification = async (id: number) => {
      try {
        const { data, error } = await useFetch<Specification>(`/categories/specifications/${id}`, {
          method: 'delete'
        })
        if (error.value) {
          throw new Error('Error al borrar la especificación intente de nuevo mas tarde.')
        }
        ElNotification({
          message: 'La especificación ha sido borrada.'
        })
      } catch (error) {
        ElNotification({
          message: error.message
        })
      }
    }

    updateSpecification = async ({ id, name }: { id: number, name: string }) => {
      try {

        const body = {
          name
        }

        const { data, error } = await useFetch<Specification>(`/categories/specifications/${id}`,
          {
            method: 'PATCH',
            body
          }
        )

        if (error.value) {
          throw new Error('Error al Editar la especificación intente de nuevo mas tarde.')
        }

        ElNotification({
          title: 'La especificación ha sido actualizada.',
          message: data.value?.name
        });
      } catch (error) {
        ElNotification({
          title: error.message
        })
      }
    }
  })