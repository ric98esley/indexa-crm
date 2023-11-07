export const useModels = () => {
  return class ModelsService {
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
        const { data, error } = await useFetch<{ total: number, rows: Model[] }>('/assets/models',
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
  }
}