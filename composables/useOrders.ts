export const useOrders = () => {
  return class OrderService {
    async getOrder({ id }: { id?: number }) {
      try {
        if (!id) {
          throw new Error('Debes cargar un id');
        }
        const { data, error } = await useFetch<Order>(`/orders/${id}`);
        if (error.value) {
          throw new Error(error.value.data.message);
        }
        return data;
      } catch (error) {
        ElNotification({
          title: 'Ha ocurrido un error al cargar la orden.',
          message: error.message,
          type: 'error',
        });
      }
    }
    async getOrderMovements({
      id,
      paranoid = false,
      all = false,
      orderType,
      movementType,
      current,
      location,
      group,
      serial,
      category,
      model,
      brand,
      limit,
      offset = 1,
      sort,
      order,
      startDate,
      endDate,
    }: {
      id: number | string;
      paranoid?: boolean;
      all?: boolean;
      orderType?: string;
      movementType?: string;
      current?: boolean;
      location?: string;
      group?: string;
      serial?: string;
      category?: string;
      model?: string;
      brand?: string;
      limit?: number;
      offset?: number;
      sort?: string;
      order?: string;
      type?: string;
      startDate?: string;
      endDate?: string;
    }) {
      try {
        if (!id) {
          throw new Error('Debes cargar un id');
        }

        const params = useFilterObject({
          paranoid,
          all,
          orderType,
          movementType,
          current,
          location,
          group,
          serial,
          category,
          model,
          brand,
          limit,
          offset: (offset - 1) * Number(limit),
          sort,
          order,
          startDate,
          endDate,
        });
        const { data, error } = await useFetch<{
          total: number;
          rows: Assignments[];
        }>(`/orders/${id}/movements`, {
          params,
        });
        if (error.value) {
          throw new Error(error.value.data.message);
        }
        return data;
      } catch (error) {
        console.log(error);
        ElNotification({
          title: 'Ha ocurrido un error al cargar la orden.',
          message: error.message,
          type: 'error',
        });
      }
    }
    async checkout({
      targets,
      placeId,
      description = 'borrowing',
    }: {
      targets: {
        assetId?: number;
        locationId?: number;
      }[];
      placeId?: number;
      description?: string;
    }) {
      try {
        if (!placeId) throw new Error('Selecciona un lugar para asignar');
        const { data, error } = await useFetch<Order>('/orders/checkout', {
          method: 'post',
          body: {
            targets: targets,
            locationId: placeId,
            description: description,
          },
        });

        if (error.value) {
          throw new Error(error.value.data.message);
        }
        ElNotification({
          message: 'Activos asignado correctamente',
        });

        if (data.value && data.value.id)
          return navigateTo(
            {
              path: `/assignments/${data.value.id}/print`,
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
      } catch (error) {
        ElNotification({
          title: 'Vuelve a intentarlo mas tarde',
          message: error.message,
        });
        console.log(error);
      }
    }
    async checking({
      targets,
      description = 'checking',
    }: {
      targets: {
        assetId?: number;
        locationId?: number;
      }[];
      placeId?: number;
      description?: string;
    }) {
      try {
        const { data, error } = await useFetch<Order>('/orders/checking', {
          method: 'post',
          body: {
            targets,
            description,
          },
        });

        if (error.value) {
          throw new Error(error.value.data.message);
        }
        ElNotification({
          message: 'Activos recibidos correctamente',
        });

        if (data.value && data.value.id)
          return navigateTo(
            {
              path: `/assignments/${data.value.id}/print`,
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
      } catch (error) {
        ElNotification({
          title: 'Error al recibir',
          message: error.message,
        });
      }
    }
  };
};
