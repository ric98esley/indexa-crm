export const useOrders = () => {
  return class OrderService {

    async  getOrder ({ id }: { id: number }) {
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
    async  getOrderMovements ({ id }: { id: number }) {
      try {
        if (!id) {
          throw new Error('Debes cargar un id')
        }
        const { data, error } = await useFetch<{total: number, rows: Assignments[]}>(`/orders/${id}/movements`);
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
    async checkout () {
      try {
        const { data, error } = await useFetch<Order>(
          '/orders/checkout',
          {
            method: 'post',
            body: {
              targets: targets.value,
              locationId: assignments.place!.id,
              description: 'borrowing'
            }
          }
        );
    
        if (error.value) {
          throw new Error()
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
          message: "Vuelve a intentarlo mas tarde",
        });
        console.log(error);
      }
    }
  }
}