export const useUserRoles = () => {
  const baseURL = '/roles';
  return class RoleService {
    async find({ }: {}) {
      const url = baseURL;
      const { data, error } = await useApi<{ total: number, rows: any }>(url, {
        method: 'GET',
      });

      if (error.value) {
        throw createError('Error al obtener roles');
      }

      if (!data.value) {
        throw createError('No se encontraron roles');
      }

      return data.value
    }

    async create({ name, ability }: { name: string, ability: Object }) {
      try {
        const body = useFilterObject({
          name,
          ability
        })
        const url = baseURL;
        const { data, error } = await useApi<{ total: number, rows: any }>(url, {
          method: 'POST',
          body
        });

        if (error.value) {
          throw new Error(error.value.data.message);
        }

        ElNotification({
          title: 'Role creado correctamente',
          type: 'success'
        })
      } catch (error: any) {
        ElNotification({
          title: 'error al crear rol',
          message: error.message,
          type: 'error'
        })
      }
    }

    async update(id: number, { name, ability }: { name: string, ability: Object }) {
      const body = useFilterObject({
        name,
        ability
      })
      const url = `${baseURL}/${id}`;
      const { data, error } = await useApi<{ total: number, rows: any }>(url, {
        method: 'PATCH',
        body
      });

      if (error.value) {
        throw createError(error.value.data.message);
      }

      if (!data.value) {
        throw createError('No se encontraron roles');
      }

      ElNotification({
        title: 'Role actualizado correctamente',
        type: 'success'
      })

    }

    async delete(id: number) {
      const url = `${baseURL}/${id}`;
      const { data, error } = await useApi<{ total: number, rows: any }>(url, {
        method: 'DELETE',
      });

      if (error.value) {
        throw createError('Error al eliminar rol');
      }

      if (!data.value) {
        throw createError('No se encontraron roles');
      }

      ElNotification({
        title: 'Role eliminado correctamente',
        type: 'success'
      })

    }
  };
};
