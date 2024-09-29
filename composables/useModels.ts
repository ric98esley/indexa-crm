export const useModels = () => {
  return class ModelsService {
    private URL = '/assets/models'
    async getModels({
      name,
      limit,
      offset,
      categoryId,
      brandId,
      category,
      brand
    }: {
      name?: string,
      category?: string,
      brand?: string
      limit?: number,
      offset?: number,
      categoryId?: number,
      brandId?: number,
    }) {
      try {
        const { data, error } = await useApi<{ total: number, rows: Model[] }>(this.URL,
          {
            params: {
              ...(name != '' && name && {
                name
              }),
              ...(category && category != '' && {
                category
              }),
              ...(brand && brand != '' && {
                brand
              }),
              ...(categoryId && {
                categoryId
              }),
              ...(brandId && {
                brandId
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
            message: 'Error al obtener las Modelos intente de nuevo mas tarde'
          })
        }
        return { data, error }
      } catch (error) {
        ElNotification({
          message: 'Error al obtener las Modelos intente de nuevo mas tarde'
        })
      }
    }
    async getModel(id: number) {
      try {
        const { data, error } = await useApi<Model>(`${this.URL}/${id}`);
        if (error.value) {
          ElNotification({
            message: 'Error al obtener la Modelo intente de nuevo mas tarde'
          })
        }
        return data.value
      } catch (error) {
        ElNotification({
          message: 'Error al obtener la Modelo intente de nuevo mas tarde'
        })
      }
    }
    async createModel({
      name,
      categoryId,
      brandId,
    }: {
      name: string,
      categoryId: number,
      brandId: number
    }) {
      try {
        const body = useFilterObject({
          name,
          categoryId,
          brandId,
        })
        const { data, error } = await useApi<Model>(this.URL, {
          method: 'POST',
          body
        });
        if (error.value) {
          throw new Error(error.value.data.message)
        }
        ElNotification({
          title: 'Modelo creada correctamente',
          message: `Se creo la Modelo ${data.value?.name} correctamente`,
          type: 'success'
        });
        return data.value
      } catch (error: any) {
        ElNotification({
          title: 'Error al crear la Modelo intente de nuevo mas tarde',
          message: error.message,
          type: 'error'
        })
      }
    }
    async updateModel({
      id,
      name,
      categoryId,
      brandId,
    }: {
      id: number,
      name?: string,
      categoryId?: number,
      brandId?: number
    }) {
      try {

        const body = useFilterObject({
          name,
          categoryId,
          brandId,
        });
        const { data, error } = await useApi<Model>(`${this.URL}/${id}`, {
          method: 'PATCH',
          body
        });
        if (error.value) {
          throw new Error(error.value.data.message);
        }
        return data.value
      } catch (error: any) {
        ElNotification({
          title: 'Error al actualizar la Modelo intente de nuevo mas tarde',
          message: error.message,
          type: 'error'
        })
      }
    }
    async deleteModel(id: number) {
      const { data, error } = await useApi<Model>(`${this.URL}/${id}`, {
        method: 'DELETE'
      });
      if (error.value) {
        throw createError(error.value.data.message);
      }
      ElNotification({
        title: 'Modelo eliminada correctamente',
        message: `Se elimino la Modelo ${data.value?.name} correctamente`,
        type: 'success'
      });
      return data.value
    }
  }
}