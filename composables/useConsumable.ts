export const useConsumable = () => {
  return class AssetsServices {
    async getLocations({
      status,
      search,
      name,
      code,
      group,
      manager,
      groupId,
      type,
      rif,
      address,
      order,
      sort,
      endDate,
      startDate,
      limit = 10,
      offset = 0,
    }: {
      status?: string[];
      search?: string;
      name?: string;
      code?: string;
      group?: string;
      groupId?: number;
      manager?: string;
      type?: string;
      rif?: string;
      address?: string;
      order?: string;
      sort?: string;
      endDate?: string;
      startDate?: string;
      limit?: number;
      offset?: number;
    }) {
      try {
        const { data, error } = await useFetch<{
          total: number;
          rows: Place[];
        }>('/consumables', {
          params: {
            ...(status &&
              status?.length > 0 && {
                status: status.join(','),
              }),
            ...(search &&
              search != '' && {
                search,
              }),
            ...(name != '' &&
              name && {
                name,
              }),
            ...(code != '' &&
              code && {
                code,
              }),
            ...(group != '' &&
              group && {
                group,
              }),
            ...(groupId && {
              groupId,
            }),
            ...(manager != '' &&
              manager && {
                manager,
              }),
            ...(type != '' &&
              type && {
                type,
              }),
            ...(rif != '' &&
              rif && {
                rif,
              }),
            ...(address != '' &&
              address && {
                address,
              }),
            ...(order != '' &&
              order && {
                order,
              }),
            ...(sort != '' &&
              sort && {
                sort,
              }),
            ...(endDate != '' &&
              endDate && {
                endDate,
              }),
            ...(startDate != '' &&
              startDate && {
                startDate,
              }),
            ...(offset && {
              offset: (offset - 1) * limit,
            }),
            ...(limit && {
              limit,
            }),
          },
        });
        if (error.value) {
          throw new Error(error.value.data.message);
        }
        return data.value
      } catch (error) {
        ElNotification({
          title: 'Error al obtener los almacenes intente de nuevo mas tarde',
          message: error.message,
        });
      }
    }
  };
};
