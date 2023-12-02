export const useOrders = () => {
  return class OrderService {
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