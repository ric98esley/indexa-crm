export const useAssets = () => {
  return class AssetsServices {
    async getAssets({
      serial,
      limit = 10,
      offset = 1,
      sort,
      order,
      all,
      enabled,
      type,
      group,
      // status, model, brand, category will be to string to search matches
      status,
      location,
      model,
      brand,
      category,
      startDate,
      endDate,
    }: {
      serial?: string;
      limit?: number;
      offset?: number;
      sort?: string;
      order?: string;
      all?: boolean;
      enabled?: boolean;
      type?: string;
      // status, model, brand, category will be to string to search matches
      status?: string;
      location?: string;
      model?: string;
      brand?: string;
      category?: string;
      startDate?: string;
      endDate?: string;
    }) {
      try {
        const params = useFilterObject({
          serial,
          limit,
          offset: (Number(offset) - 1) * Number(limit),
          sort,
          order,
          all,
          enabled,
          type,
          group,
          status,
          location,
          model,
          brand,
          category,
          startDate,
          endDate,
        });

        const { data, error } = await useFetch<{
          rows: Asset[];
          total: number;
        }>('/assets', {
          params,
        });

        if (error.value) {
          throw new Error(error.value.data.message);
        }

        return data;
      } catch (error) {
        ElNotification({
          title: 'Error al cargar los activos',
          message: error.message,
        });
      }
    }
    async finOne({ id }: { id: number }) {
      try {
        const { data, error } = await useFetch<Asset>(`/assets/${id}`);

        if (error.value) {
          throw new Error(error.value.data.message);
        }
        return data;
      } catch (error) {
        ElNotification({
          title: 'Error al obtener el activo',
          message: error.message,
          type: 'error',
        });
      }
    }
    async findOneLogs({ id }: { id: number }) {
      try {
        const { data, error } = await useFetch<{ total: number; rows: Log[] }>(
          `/assets/${id}/logs`
        );

        if (error.value) {
          throw new Error(error.value.data.message);
        }
        return data.value;
      } catch (error) {
        ElNotification({
          title: 'Error al obtener el activo',
          message: error.message,
          type: 'error',
        });
      }
    }
    async delete({ id, message }: { id: number; message: string }) {
      try {
        const { data, error } = await useFetch<Asset>(`/assets/${id}`, {
          method: 'DELETE',
          body: {
            message,
          },
        });

        if (error.value) {
          throw new Error(error.value.data.message);
        }
        ElNotification({
          title: 'Activo ocultado',
          type: 'success',
        });
        return data.value;
      } catch (error) {
        ElNotification({
          title: 'Error al ocultar el activo',
          message: error.message,
          type: 'error',
        });
      }
    }
    async create({
      assets,
      description,
      notes,
      content,
    }: {
      assets: NewAsset[];
      description: string;
      notes?: string;
      content: string;
    }) {
      try {
        const body = useFilterObject({
          assets,
          description,
          notes,
          content,
        });

        const loading = ElLoading.service({
          lock: true,
          text: 'Guardando',
          background: 'rgba(0, 0, 0, 0.7)',
        })

        const { data, error } = await useFetch<{
          created: Asset[];
          errors: Asset[];
        }>('/assets', {
          method: 'post',
          body,
        });

        loading.close();

        if(error.value) {
          throw new Error(error.value.data.message);
        }

        if (data.value) {
          let i = 0;
    
          for (const asset of data.value.errors) {
            setTimeout(function () {
              ElMessage({
                message: `Activo duplicado Serial: ${asset.serial}`,
                type: 'error',
              });
            }, i * 200); // El retraso depende del valor de i
            i++;
          }
          for (const asset of data.value.created) {
            setTimeout(function () {
              ElMessage({
                message: `Activo creado correctamente serial: ${asset.serial}`,
                type: 'success',
              });
            }, i * 200);
            i++;
          };
        }
      } catch (error) {
        ElNotification({
          title: 'Error al cargar los activos',
          message: error.message,
          type: 'error'
        });
      }
    }
    async getAssetMovements({
      id,
      paranoid,
      current,
      all,
      orderType,
      movementType,
      location,
      group,
      serial,
      category,
      model,
      brand,
      limit,
      offset,
      sort,
      order,
      startDate,
      endDate,
    }: {
      id: number;
      paranoid?: boolean;
      current?: boolean;
      all?: boolean;
      orderType?: string;
      movementType?: string;
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
      startDate?: string;
      endDate?: string;
    }) {
      try {
        const params = useFilterObject({
          paranoid,
          current,
          all,
          orderType,
          movementType,
          location,
          group,
          serial,
          category,
          model,
          brand,
          limit,
          offset,
          sort,
          order,
          startDate,
          endDate,
        });
        const { data, error } = await useFetch<{
          rows: Assignments[];
          total: number;
        }>(`/assets/${id}/movements`, {
          params,
        });

        if (error.value) {
          throw new Error(error.value.data.message);
        }
        return data;
      } catch (error) {
        ElNotification({
          title: 'Error al obtener los movimientos del activo',
          message: error.message,
          type: 'error',
        });
      }
    }
    async getExcel({
      serial,
      limit,
      offset,
      sort,
      order,
      all,
      enabled,
      type,
      // status, model, brand, category will be to string to search matches
      status,
      location,
      model,
      brand,
      category,
      startDate,
      endDate,
    }: {
      serial?: string;
      limit?: number;
      offset?: number;
      sort?: string;
      order?: string;
      all?: boolean;
      enabled?: boolean;
      type?: string;
      // status, model, brand, category will be to string to search matches
      status?: string;
      location?: string;
      model?: string;
      brand?: string;
      category?: string;
      startDate?: string;
      endDate?: string;
    }) {
      try {
        const params = useFilterObject({
          serial,
          limit,
          offset: (Number(offset) - 1) * Number(limit),
          sort,
          order,
          all,
          enabled,
          type,
          // status, model, brand, category will be to string to search matches
          status,
          location,
          model,
          brand,
          category,
          startDate,
          endDate,
        });
        const { data: file, error } = await useFetch<Blob>('/assets/excel', {
          params,
        });
        if (error.value) {
          throw new Error();
        }

        let date = new Date();
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();

        // Create a temporary link element to trigger the file download
        const url = window.URL.createObjectURL(new Blob([file.value]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${day}-${month}-${year}-historial.xlsx`);
        document.body.appendChild(link);

        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.log(error);
        ElNotification({
          message: 'Error al obtener las historias intente de nuevo mas tarde',
        });
      }
    }
    async patchAsset({
      id,
      locationId,
      modelId,
      notes,
    }: {
      id: number;
      locationId?: number;
      modelId?: number;
      notes?: string;
    }) {
      try {
        const body = {
          ...(locationId && {
            locationId,
          }),
          ...(modelId && {
            modelId,
          }),
          ...(notes && {
            notes,
          }),
        };

        const { data, error } = await useFetch<Asset>(`/assets/${id}`, {
          method: 'PATCH',
          body,
        });

        if (error.value) {
          throw new Error(error.value.data.message);
        }
        console.log(data.value);

        ElNotification({
          title: 'Activo modificado correctamente',
          message: `${data.value?.serial}`,
          type: 'success',
        });

        return data;
      } catch (error) {
        ElNotification({
          title: 'Error al modificar la zona intente de nuevo mas tarde',
          message: error.message,
          type: 'error',
        });
      }
    }
  };
};
