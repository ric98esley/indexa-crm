export const useOrders = () => {
  return class OrderService {
    private URL = '/orders'
    async getOrder({ id }: { id?: number }) {
      try {
        if (!id) {
          throw new Error('Debes cargar un id');
        }
        const { data, error } = await useApi<Order>(`${this.URL}/${id}`);
        if (error.value) {
          throw new Error(error.value.data.message);
        }
        return data;
      } catch (error: any) {
        ElNotification({
          title: 'Ha ocurrido un error al cargar la orden.',
          message: error.message,
          type: 'error',
        });
      }
    }
    async getOrders({
      limit = 10,
      offset = 1,
      type,
      location,
      notes,
      description,
      startDate,
      endDate
    }: {
      limit: number;
      offset: number;
      type?: string;
      notes?: string;
      description?: string;
      location?: string;
      startDate?: string;
      endDate?: string;
    }) {
      try {

        const params = useFilterObject({
          limit,
          offset: (offset - 1) * limit,
          type,
          notes,
          location,
          description,
          startDate,
          endDate,
        })
        const { data, error } = await useApi<{rows: Order[], total: number}>(this.URL, {
          params
        });
        if (error.value) {
          throw new Error(error.value.data.message);
        }
        return data.value;
      } catch (error: any) {
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
        const { data, error } = await useApi<{
          total: number;
          rows: Assignments[];
        }>(`${this.URL}/${id}/movements`, {
          params,
        });
        if (error.value) {
          throw new Error(error.value.data.message);
        }
        return data;
      } catch (error: any) {
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
      notes,
      content,
    }: {
      targets: {
        assetId?: number;
        locationId?: number;
      }[];
      placeId?: number;
      description?: string;
      notes?: string;
      content?: string;
    }) {
      try {
        if (!placeId) throw new Error('Selecciona un lugar para asignar');

        const loading = ElLoading.service({
          lock: true,
          text: 'Guardando',
          background: 'rgba(0, 0, 0, 0.7)',
        });

        const body = useFilterObject({
          targets,
          locationId: placeId,
          description,
          notes,
          content,
        });
        const { data, error } = await useApi<Order>(`${this.URL}/checkout`, {
          method: 'post',
          body,
        });

        loading.close();

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
      } catch (error: any) {
        ElNotification({
          title: 'Vuelve a intentarlo mas tarde',
          message: error.message,
          type: 'error'
        });
      }
    }
    async checking({
      targets,
      placeId,
      description = 'borrowing',
      notes,
      content,
    }: {
      targets: {
        assetId?: number;
        locationId?: number;
      }[];
      placeId?: number;
      description?: string;
      notes?: string;
      content?: string;
    }) {
      try {

        const body = useFilterObject({
          targets,
          locationId: placeId,
          description,
          notes,
          content,
        });

        const loading = ElLoading.service({
          lock: true,
          text: 'Guardando',
          background: 'rgba(0, 0, 0, 0.7)',
        });
        const { data, error } = await useApi<Order>(`${this.URL}/checking`, {
          method: 'post',
          body
        });

        loading.close();

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
      } catch (error: any) {
        ElNotification({
          title: 'Error al recibir',
          message: error.message,
          type: 'error'
        });
      }
    }
  };
};
