import { AnyNaptrRecord } from "dns";

export const useConsumable = () => {
  return class AssetsServices {
    private URL = '/consumables'
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
        const { data, error } = await useApi<{
          total: number;
          rows: Place[];
        }>(this.URL, {
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
      } catch (error: any) {
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
        const { data, error } = await useApi<{
          rows: Consumable[];
          total: number;
        }>(`/${this.URL}/${id}/products`, {
          params,
        });
        if (error.value) {
          throw new Error(error.value.data.message);
        }
        return data.value;
      } catch (error: any) {
        ElNotification({
          title: 'Error al obtener el inventario',
          message: error.message,
          type: 'error',
        });
      }
    }
    async findOneHistory({
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
        const { data, error } = await useApi<{
          rows: Consumable[];
          total: number;
        }>(`/${this.URL}/${id}/movements`, {
          params,
        });
        if (error.value) {
          throw new Error(error.value.data.message);
        }
        return data.value;
      } catch (error: any) {
        ElNotification({
          title: 'Error al obtener los movimientos',
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
        productId?: number;
        quantity?: string;
        min?: string;
      }[];
    }) {
      try {
        const body = useFilterObject({
          customer,
          description,
          targets: rows,
        });
        const { data, error } = await useApi<Lot>(
          `/${this.URL}/${id}/checking`,
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
              path: `/${this.URL}/${data.value.locationId}/lot/${data.value.id}/print`,
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
      } catch (error: any) {
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
        productId?: number;
        quantity?: string;
        min?: string;
      }[];
    }) {
      try {
        const body = useFilterObject({
          customer,
          description,
          targets: rows,
        });
        const { data, error } = await useApi<Lot>(
          `/${this.URL}/${id}/checkout`,
          {
            method: 'POST',
            body,
          }
        );

        if (data.value && data.value.id)
          return navigateTo(
            {
              path: `/${this.URL}/${data.value.locationId!}/lot/${data.value.id}/print`,
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
      } catch (error: any) {
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
        await useApi<Consumable>(`/${this.URL}/${locationId}/products/${productId}`,
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
      warehouseId
    }: {
      customer?: string;
      type?: string;
      description?: string;
      limit?: number;
      offset?: number;
      warehouseId: number;
    }) {
      try {
        const params = useFilterObject({
          limit,
          ...(offset && { offset: (Number(offset) - 1) * Number(limit) }),
          customer,
          type,
          description,
        });
        const { data, error } = await useApi<{
          rows: Lot[];
          total: number;
        }>(`/${this.URL}/${warehouseId}/lots`, {
          params,
        });
        if (error.value) {
          throw new Error(error.value.data.message);
        }
        return data.value;
      } catch (error: any) {
        ElNotification({
          title: 'Error al cargar el historial',
          message: error.message,
          type: 'error',
        });
      }
    }
    async getOneLot({ id , warehouseId}: { id: number | string , warehouseId: number | string}) {
      try {
        const { data, error } = await useApi<Lot>(`/${this.URL}/${warehouseId}/lots/${id}`);
        if (error.value) {
          throw new Error(error.value.data.message);
        }
        return data.value;
      } catch (error: any) {
        ElNotification({
          title: 'Error al cargar el historial',
          message: error.message,
          type: 'error',
        });
      }
    }
  };
};
