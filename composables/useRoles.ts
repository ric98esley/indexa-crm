export const useUserRoles = () => {
  const baseURL = '/roles';

  return class RoleService {
    async find({}: {}) {
      try {
        const url = baseURL;
        const { data, error } = await useApi<{total: number, rows: any}>(url, {
          method: 'GET',
        });

        return data.value
      } catch (error) {
        ElNotification({
          title: 'Error al obtener los roles',
          message: error.message,
          type: 'error'
        })
      }
    }

    async create({name, ability}: {name: string, ability: Object }) {
      try {
        const body = useFilterObject({
          name,
          ability
        })
        const url = baseURL;
        const { data, error } = await useApi<{total: number, rows: any}>(url, {
          method: 'POST',
          body
        });

        if(error.value) {
          throw new Error(error.value.data.message);
        }

        ElNotification({
          title: 'Role creado correctamente',
          type: 'success'
        })
      } catch (error) {
        ElNotification({
          title: 'error al crear rol',
          message: error.message,
          type: 'error'
        })
      }
    }
  };
};
