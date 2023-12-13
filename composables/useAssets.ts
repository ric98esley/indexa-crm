import { title } from "process";

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
      // status, model, brand, category will be to string to search matches
      status,
      location,
      model,
      brand,
      category,
      startDate,
      endDate,
    }: {
      serial?: string,
      limit?: number,
      offset?: number,
      sort?: string,
      order?: string,
      all?: string,
      enabled?: boolean,
      type?: string,
      // status, model, brand, category will be to string to search matches
      status?: string,
      location?: string,
      model?: string,
      brand?: string,
      category?: string,
      startDate?: string,
      endDate?: string,
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

        const { data, error } = await useFetch<{ rows: Asset[], total: number }>('/assets',
          {
            params
          }
        );

        if (error.value) {
          throw new Error(error.value.data.message);
        }

        return data
      } catch (error) {
        ElNotification({
          title: 'Error al cargar los activos',
          message: error.message,
        })
      }
    }
    async finOne({
      id
    }: {
      id: number
    }) {
      try {
        const { data, error } = await useFetch<Asset>(`/assets/${id}`,
        );

        if(error.value) {
          throw new Error(error.value.data.message)
        }
        return data
      } catch (error) {
        ElNotification({
          title: 'Error al obtener el activo',
          message: error.message,
          type: 'error'
        }
        )
      }
    }
    async getExcel(
      {
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
        serial?: string,
        limit?: number,
        offset?: number,
        sort?: string,
        order?: string,
        all?: string,
        enabled?: boolean,
        type?: string,
        // status, model, brand, category will be to string to search matches
        status?: string,
        location?: string,
        model?: string,
        brand?: string,
        category?: string,
        startDate?: string,
        endDate?: string,
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
        const { data: file, error } = await useFetch<Blob>('/assets/excel',
          {
            params
          },
        );
        if (error.value) {
          throw new Error()
        }

        let date = new Date();
        const day = date.getDate()
        const month = date.getMonth()
        const year = date.getFullYear()

        // Create a temporary link element to trigger the file download
        const url = window.URL.createObjectURL(new Blob([file.value]));
        const link = document.createElement("a");
        link.href = url
        link.setAttribute("download", `${day}-${month}-${year}-historial.xlsx`);
        document.body.appendChild(link);

        link.click();
        document.body.removeChild(link);

      } catch (error) {
        console.log(error)
        ElNotification({
          message: 'Error al obtener las historias intente de nuevo mas tarde'
        })
      }
    }
    async patchAsset({
      id,
      locationId,
      modelId
    }: {
      id: number,
      locationId?: number,
      modelId?: number
    }) {
      try {
        const body = {
          ...(locationId && {
            locationId
          }),
          ...(modelId && {
            modelId
          }),
        }

        const { data, error } = await useFetch<Asset>(`/assets/${id}`,
          {
            method: 'PATCH',
            body
          }
        );

        if (error.value) {
          throw new Error(error.value.data.message);
        }
        console.log(data.value)

        ElNotification({
          title: 'Activo modificado correctamente',
          message: `${data.value?.serial}`,
          type: 'success'
        });

        return data
      } catch (error) {
        ElNotification({
          title: 'Error al modificar la zona intente de nuevo mas tarde',
          message: error.message,
          type: 'error'
        })
      }
    }
  }
}