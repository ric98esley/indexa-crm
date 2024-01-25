export const useGroups = () =>
  class GroupsService {
    async getGroups({
      name,
      manager,
      code,
      parent,
      limit,
      offset = 0,
    }: {
      name?: string;
      manager?: string;
      code?: string;
      parent?: string;
      limit?: number;
      offset?: number;
    }) {
      try {
        const { data, error } = await useFetch<{
          total: number;
          rows: Group[];
        }>('/groups', {
          params: {
            ...(name != '' &&
              name && {
                name,
              }),
            ...(code != '' &&
              code && {
                code,
              }),
            ...(parent != '' &&
              parent && {
                parent,
              }),
            ...(manager != '' &&
              manager && {
                manager,
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
          title: 'Error al obtener las marcas intente de nuevo mas tarde',
          message: error.message,
        });
      }
    }
    async getGroup(id: number | string) {
      try {
        const { data, error } = await useFetch<Group>(`/groups/${id}`);

        if (error.value) {
          throw new Error(error.value.data.message);
        }
        return data.value;
      } catch (error) {
        ElNotification({
          title: 'Error al obtener el grupo intente de nuevo mas tarde',
          message: error.message,
          type: 'error',
        });
      }
    }

    async getGroupLocation(id: number | string) {
      try {
        const { data, error } = await useFetch<{rows: Place[], total: number}>(`/groups/${id}/locations`);

        if (error.value) {
          throw new Error(error.value.data.message);
        }
        return data.value;
      } catch (error) {
        ElNotification({
          title: 'Error al obtener el grupo intente de nuevo mas tarde',
          message: error.message,
          type: 'error',
        });
      }
    }

    async createGroup(group: Group) {
      try {
        if (!group.name || !group.code)
          throw new Error('Debe ingresar el nombre y el código del grupo');
        const { data, error } = await useFetch<Group>('/groups', {
          method: 'post',
          body: {
            name: group.name,
            code: group.code,
            parentId: group.parentId,
            managerId: group.managerId,
          },
        });

        if (
          error.value &&
          error.value.statusCode &&
          error.value.statusCode >= 400
        ) {
          throw new Error(error.value.data.message);
        }
        ElNotification({
          title: 'Grupo creado correctamente',
          message: `${data.value?.name}`,
        });
        group.id = undefined;
        group.name = '';
        group.code = '';
        return data.value;
      } catch (error) {
        ElNotification({
          title: 'Error el grupo intente de nuevo mas tarde',
          message: error.message,
        });
      }
    }

    async updateGroup(group: Group) {
      try {
        const body = {
          name: group.name,
          code: group.code,
          parentId: group.parentId,
          managerId: group.managerId,
        };

        const { data, error } = await useFetch<Group>(`/groups/${group.id}`, {
          method: 'PATCH',
          body,
        });

        if (error.value) {
          throw new Error(error.value.data.message);
        }
        ElNotification({
          title: 'Grupo modificado correctamente',
          message: `${data.value?.name}`,
        });

        group.id = undefined;
        group.name = '';
        group.code = '';
        return data.value;
      } catch (error) {
        ElNotification({
          title: 'Error al modificar el grupo intente de nuevo mas tarde',
          message: error.message,
        });
      }
    }

    async deleteGroup(id: number) {
      try {
        const { data, error } = await useFetch<Group>(`/groups/${id}`, {
          method: 'delete',
        });

        if (error.value) {
          throw new Error(error.value.data.message);
        }

        ElNotification({
          message: 'El grupo ha sido borrada.',
          type: 'warning',
        });
        return data.value;
      } catch (error) {
        ElNotification({
          title: 'Error al borrar el grupo intente de nuevo mas tarde.',
          message: error.message,
          type: 'error',
        });
      }
    }
  };
