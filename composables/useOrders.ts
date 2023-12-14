export const useOrders = () => {
  return class OrderService {

    async getOrder({ id }: { id?: number }) {
      try {
        if (!id) {
          throw new Error('Debes cargar un id')
        }
        console.log('before')
        const { data, error } = await useFetch<Order>(`/orders/${id}`);
        if (error.value) {
          throw new Error(error.value.data.message);
        }
        console.log(data)
        return data
      } catch (error) {
        ElNotification({
          title: 'Ha ocurrido un error al cargar la orden.',
          message: error.message,
        })
      }
    }
    async getOrderMovements({ id, limit }: { id?: number, limit: number }) {
      try {
        if (!id) {
          throw new Error('Debes cargar un id')
        }
        const { data, error } = await useFetch<{ total: number, rows: Assignments[] }>(`/orders/${id}/movements`,
          {
            params: {
              limit
            }
          }
        );
        if (error.value) {
          throw new Error(error.value.data.message);
        }
        return data
      } catch (error) {
        console.log(error);
        ElNotification({
          title: 'Ha ocurrido un error al cargar la orden.',
          message: error.message,
        })
      }
    }
    async checkout({ targets, placeId, description = 'borrowing' }: {
      targets: {
        assetId?: number;
        locationId?: number;
      }[];
      placeId?: number;
      description?: string;
    }) {
      try {
        if (!placeId) throw new Error('Selecciona un lugar para asignar');
        const { data, error } = await useFetch<Order>(
          '/orders/checkout',
          {
            method: 'post',
            body: {
              targets: targets,
              locationId: placeId,
              description: description
            }
          }
        );

        if (error.value) {
          throw new Error(error.value.data.message)
        }
        ElNotification({
          message: "Activos asignado correctamente",
        });

        if (data.value && data.value.id) return navigateTo(
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
              }
            }
          })

      } catch (error) {
        ElNotification({
          title: "Vuelve a intentarlo mas tarde",
          message: error.message,
        });
        console.log(error);
      }
    }
    async checking({ targets, description = 'checking' }: {
      targets: {
        assetId?: number;
        locationId?: number;
      }[];
      placeId?: number;
      description?: string;
    }) {
      try {
        const { data, error } = await useFetch<Order>(
          '/orders/checking',
          {
            method: 'post',
            body: {
              targets,
              description
            }
          }
        );

        if (error.value) {
          throw new Error(error.value.data.message)
        }
        ElNotification({
          message: "Activos recibidos correctamente",
        });

        if (data.value && data.value.id) return navigateTo(
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
              }
            }
          })

      } catch (error) {
        ElNotification({
          title: "Error al recibir",
          message: error.message,
        });
      }

    }
  }
}