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
        return data.value;
      } catch (error) {
        ElNotification({
          title: 'Error al obtener los almacenes intente de nuevo mas tarde',
          message: error.message,
        });
      }
    }

    async findOneInventory({
      id,
      search,
      limit,
      offset,
    }: {
      id?: number | string;
      search?: string;
      limit?: number;
      offset?: number;
    }) {
      try {
        const params = useFilterObject({
          limit,
          ...(offset && { offset: (Number(offset) - 1) * Number(limit) }),
          search,
        });
        const { data, error } = await useFetch<{
          rows: Consumable[];
          total: number;
        }>(`/consumables/${id}/products`, {
          params,
        });
        if (error.value) {
          throw new Error(error.value.data.message);
        }
        return data.value;
      } catch (error) {
        ElNotification({
          title: 'Error al obtener el inventario',
          message: error.message,
          type: 'error',
        });
      }
    }

    async checking({
      id,
      customer,
      description,
      rows = [],
    }: {
      id: number;
      customer: string;
      description: string;
      rows: {
        productId: number;
        quantity: string;
      }[];
    }) {
      try {
        const body = useFilterObject({
          customer,
          description,
          targets: rows,
        });
        const { data, error } = await useFetch<Lot>(
          `/consumables/${id}/checking`,
          {
            method: 'POST',
            body,
          }
        );

        ElNotification({
          title: 'Productos agregados',
          message: 'Los productos han sido agregados al inventario',
          type: 'success',
        });

        if (data.value && data.value.id)
          return navigateTo(
            {
              path: `/consumables/1/lot/${data.value.id}/print`,
            },
            {
              open: {
                target: '_blank',
                windowFeatures: {
                  popup: true,
                  noopener: true,
                  noreferrer: true,
                },
              },
            }
          );

        return data.value;
      } catch (error) {
        ElNotification({
          title: 'Error al crear la orden',
          message: error.message,
          type: 'error',
        });
      }
    }
    async checkout({
      id,
      customer,
      description,
      rows = [],
    }: {
      id: number;
      customer: string;
      description: string;
      rows: {
        productId: number;
        quantity: string;
      }[];
    }) {
      try {
        const body = useFilterObject({
          customer,
          description,
          targets: rows,
        });
        const { data, error } = await useFetch<Lot>(
          `/consumables/${id}/checkout`,
          {
            method: 'POST',
            body,
          }
        );

        if (data.value && data.value.id)
          return navigateTo(
            {
              path: `/consumables/1/lot/${data.value.id}/print`,
            },
            {
              open: {
                target: '_blank',
                windowFeatures: {
                  popup: true,
                  noopener: true,
                  noreferrer: true,
                },
              },
            }
          );

        ElNotification({
          title: 'Productos removidos',
          message: 'Los productos han sido removidos del inventario',
          type: 'success',
        });

        return data.value;
      } catch (error) {
        ElNotification({
          title: 'Error al crear la orden',
          message: error.message,
          type: 'error',
        });
      }
    }

    async updateInventory({
      productId,
      locationId,
      min
    }: {
      productId: number | string;
      locationId: number | string;
      min: string
    }) {
      try {
        const body = {
          min
        }
        await useFetch<Consumable>(`/consumables/${locationId}/products/${productId}`,
        {
          method: 'PATCH',
          body
        })
      } catch (error) {}
    }

    async getLots({
      customer,
      type,
      description,
      limit,
      offset,
    }: {
      customer?: string;
      type?: string;
      description?: string;
      limit?: number;
      offset?: number;
    }) {
      try {
        const params = useFilterObject({
          limit,
          ...(offset && { offset: (Number(offset) - 1) * Number(limit) }),
          customer,
          type,
          description,
        });
        const { data, error } = await useFetch<{
          rows: Lot[];
          total: number;
        }>(`/consumables/lots`, {
          params,
        });
        if (error.value) {
          throw new Error(error.value.data.message);
        }
        return data.value;
      } catch (error) {
        ElNotification({
          title: 'Error al cargar el historial',
          message: error.message,
          type: 'error',
        });
      }
    }
    async getOneLot({ id }: { id: number | string }) {
      try {
        const { data, error } = await useFetch<Lot>(`/consumables/lots/${id}`);
        if (error.value) {
          throw new Error(error.value.data.message);
        }
        return data.value;
      } catch (error) {
        ElNotification({
          title: 'Error al cargar el historial',
          message: error.message,
          type: 'error',
        });
      }
    }
  };
};
