export const useMovements = () => {
  return class MovementsService {
    private URL = '/movements'
    async getMovements ({
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
      offset,
      sort,
      order,
      startDate,
      endDate,
    }: {
      paranoid?: boolean,
      all?: boolean,
      orderType?: string,
      movementType?: string,
      current?: boolean,
      location?: string,
      group?: string,
      serial?: string,
      category?: string,
      model?: string,
      brand?: string,
      limit?: number,
      offset?: number,
      sort?: string,
      order?: string,
      type?: string,
      startDate?: string,
      endDate?: string,
    }) {
      try {
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
          offset: ((offset ?? 1 ) - 1) * Number(limit),
          sort,
          order,
          startDate,
          endDate,
        })
        const { data, error } = await useApi<{ total: number, rows: Assignments[] }>(this.URL, {
          params
        });

        if(error.value) {
          throw new Error(error.value.data.message)
        }
        return data
      } catch (error: any) {
        ElNotification({
          title: 'Error al cargar los movimientos',
          message: error.message,
          type: 'error'
        })
      }
    }

    async getExcelAssignment({
      current,
      orderType,
      movementType,
      location,
      group,
      groupId,
      serial,
      category,
      model,
      brand,
      limit = 10,
      offset = 0,
      sort,
      order,
      startDate,
      endDate
    }: {
      current?: boolean,
      orderType?: string,
      movementType?: string,
      location?: string,
      group?: string,
      serial?: string,
      category?: string,
      groupId?: number,
      model?: string,
      brand?: string,
      limit?: number,
      offset?: number,
      sort?: string,
      order?: string,
      startDate?: string,
      endDate?: string
    }){
      try {
        const { data: file, error } = await useApi<Blob>(`${this.URL}/excel`,
          {
            params: {
              ...(serial != '' && serial && {
                serial
              }),
              ...(groupId && {
                groupId,
              }),
              ...(orderType != '' && orderType && {
                orderType: orderType
              }),
              ...(model != '' && model && {
                model
              }),
              ...(category != '' && category && {
                category
              }),
              ...(brand != '' && brand && {
                brand
              }),
              ...(offset && {
                offset: (offset - 1) * Number(limit)
              }),
              ...(limit && {
                limit
              }),
              ...(endDate && startDate && {
                startDate,
                endDate
              }),
              ...(location && location !== '' && {
                location
              }),
              ...(current != undefined && {
                current
              }),
              ...(movementType && {
                movementType
              }),
              ...(group && {
                group
              }),
              ...(sort && {
                sort
              }),
              ...(order && {
                order
              })
            }
          },

        );
        if (error.value) {
          throw new Error()
        }

        let date = new Date();
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();

        // Create a temporary link element to trigger the file download
        const url = window.URL.createObjectURL(new Blob([file.value ?? '']));
        const link = document.createElement("a");
        link.href = url
        link.setAttribute("download", `${day}-${month}-${year}-asignaciones.xlsx`);
        document.body.appendChild(link);

        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.log(error)
        ElNotification({
          message: 'Error al obtener el historial intente de nuevo mas tarde'
        })
      }
    }

    async getMovementsByLocations({
      limit = 10,
      offset = 0,
      startDate = '',
      endDate = '',
      search = '',
      orderType = '',
    }) {
      try {
        const params = useFilterObject({
          limit,
          offset: (offset - 1) * Number(limit),
          startDate,
          endDate,
          search,
          orderType
        })
        const { data, error } = await useApi<{ total: number, rows: LocationMovementCount[] }>(`${this.URL}/locations`, {
          params
        });

        return data.value
      } catch (error: any) {
        ElNotification({
          title: 'Error al cargar los movimientos',
          message: error.message,
          type: 'error'
        })
      }
    }
  }
}