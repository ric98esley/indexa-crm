export const useFindGeo = async (filters: FindGeoAlert) => {
  try {
    const { data, error } = await useApi<{ rows: GeoAlert[], total: number }>('/geolocation', {
      params: useFilterObject({
        ...filters,
        offset: filters.offset > 0 ? (filters.offset - 1) * filters.limit : 0,
      }),
    })

    return data.value
  } catch (error) {
    ElNotification({
      title: 'Error al obtener las alertas',
      type: 'error',
    });
    console.error(error)
    return {
      rows: [],
      total: 0
    }
  }
}