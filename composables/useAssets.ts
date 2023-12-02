export const useAssets = () => {
  return class AssetsServices {
    async getAssets({
      serial,
      limit,
      offset,
      sort,
      order,
      all,
      enabled,
      type,
      // status, model, brand, category will be to string to search matches
      status,
      deposit,
      model,
      brand,
      category,
      startDate,
      endDate,
    }: {
      serial?: string,
      limit?: string,
      offset?: string,
      sort?: string,
      order?: string,
      all?: string,
      enabled?: boolean,
      type?: string,
      // status, model, brand, category will be to string to search matches
      status?: string,
      deposit?: string,
      model?: string,
      brand?: string,
      category?: string,
      startDate?: string,
      endDate?: string,
    }) {
      try {

        const params = useFilterObject({
          serial,
          limit,
          offset,
          sort,
          order,
          all,
          enabled,
          type,
          // status, model, brand, category will be to string to search matches
          status,
          deposit,
          model,
          brand,
          category,
          startDate,
          endDate,
        });

        const { data, error } = await useFetch<{ rows: Asset[], total: number }>('/assets',
          {
            params
          }
        );

        if(error.value) {
          throw new Error(error.value.data.message);
        }

        return { data, error }
      } catch (error) {
        ElNotification({
          title: 'Error al cargar los activos',
          message: error.message,
        })
      }
    }
  }
}