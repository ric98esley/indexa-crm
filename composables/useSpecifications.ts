export const useSpecifications = () => (
  class SpecificationsService {
    private URL = '/categories/specifications'
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
        const { data, error } = await useApi<{ total: number, rows: Specification[] }>(this.URL,
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
        const { data, error } = await useApi<Specification>(this.URL,
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
        const { data, error } = await useApi<Specification>(`${this.URL}/${id}`, {
          method: 'delete'
        })
        if (error.value) {
          throw new Error('Error al borrar la especificación intente de nuevo mas tarde.')
        }
        ElNotification({
          message: 'La especificación ha sido borrada.'
        })
      } catch (error : any) {
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

        const { data, error } = await useApi<Specification>(`${this.URL}/${id}`,
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
      } catch (error : any) {
        ElNotification({
          title: error.message
        })
      }
    }
  })