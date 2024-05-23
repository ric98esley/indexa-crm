export const useGroups = () =>
  class GroupsService {
    private URL = '/groups'
    async getGroups({
      name,
      manager,
      code,
      parent,
      limit = 10,
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
        const { data, error } = await useApi<{
          total: number;
          rows: Group[];
        }>(this.URL, {
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
      } catch (error: any) {
        ElNotification({
          title: 'Error al obtener las marcas intente de nuevo mas tarde',
          message: error.message,
        });
      }
    }
    async getGroup(id: number | string) {
      try {
        const { data, error } = await useApi<Group>(`${this.URL}/${id}`);

        if (error.value) {
          throw new Error(error.value.data.message);
        }
        return data.value;
      } catch (error: any) {
        ElNotification({
          title: 'Error al obtener el grupo intente de nuevo mas tarde',
          message: error.message,
          type: 'error',
        });
      }
    }

    async getGroupLocation(id: number | string) {
      try {
        const { data, error } = await useApi<{rows: Place[], total: number}>(`${this.URL}/${id}/locations`);

        if (error.value) {
          throw new Error(error.value.data.message);
        }
        return data.value;
      } catch (error: any) {
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
        const { data, error } = await useApi<Group>(this.URL, {
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
          type: 'success'
        });
        group.id = undefined;
        group.name = '';
        group.code = '';
        return data.value;
      } catch (error: any) {
        ElNotification({
          title: 'Error el grupo intente de nuevo mas tarde',
          message: error.message,
          type: 'error'
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

        const { data, error } = await useApi<Group>(`${this.URL}/${group.id}`, {
          method: 'PATCH',
          body,
        });

        if (error.value) {
          throw new Error(error.value.data.message);
        }
        ElNotification({
          title: 'Grupo modificado correctamente',
          message: `${data.value?.name}`,
          type: 'success'
        });

        return data.value;
      } catch (error: any) {
        ElNotification({
          title: 'Error al modificar el grupo intente de nuevo mas tarde',
          message: error.message,
          type: 'error'
        });
      }
    }

    async deleteGroup(id: number) {
      try {
        const { data, error } = await useApi<Group>(`${this.URL}/${id}`, {
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
      } catch (error: any) {
        ElNotification({
          title: 'Error al borrar el grupo intente de nuevo mas tarde.',
          message: error.message,
          type: 'error',
        });
      }
    }
  };
