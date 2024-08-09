export const useFindMaintenanceType = async () => {
  try {
    const { data, error } = await useApi<{ rows: MaintenanceType[], total: number }>('/maintenances/types')

    return data.value
  } catch (error) {
    ElNotification({
      title: 'Error al cargar los tipos de mantenimientos',
      type: 'error'
    })
  }
}

export const useCreateMaintenanceType = async (maintenance: CreateMaintenanceType) => {
  try {
    const { data, error } = await useApi<MaintenanceType>('/maintenances/types', {
      method: 'POST',
      body: useFilterObject(maintenance)
    })

    return data.value
  } catch (error) {
    console.log(error)
    ElNotification({
      title: 'Error al crear el tipo de mantenimiento',
      type: 'error'
    })
  }
}

export const useUpdateMaintenanceType = async (id: number, maintenance: CreateMaintenanceType) => {
  try {
    const { data, error } = await useApi<MaintenanceType>(`/maintenances/types/${id}`, {
      methods: 'PATCH',
      body: maintenance
    })

    if(error.value) {
      throw new Error(error.value.data.message)
    }

    return data.value
  } catch (error) {
    ElNotification({
      title: 'Error al actualizar el tipo de mantenimiento',
      type: 'error'
    })
  }
}

export const useDeleteMaintenanceType = async (id: number) => {
  try {
    const { data, error } = await useApi<MaintenanceType>(`/maintenances/types/${id}`, {
      methods: 'DELETE'
    })

    
    if(error.value) {
      throw new Error(error.value.data.message)
    }

    return data.value
  } catch (error) {
    ElNotification({
      title: 'Error al eliminar el tipo de mantenimiento',
      type: 'error'
    })
  }
}

export const useFindMaintenance = async () => {
  try {
    const { data, error } = await useApi<Maintenance>('/maintenances')

    return data.value
  } catch (error) {
    ElNotification({
      title: 'Error al cargar los mantenimientos',
      type: 'error'
    })
  }
}

export const useCreateMaintenance = async (maintenance: Maintenance) => {
  try {
    const { data, error } = await useApi<Maintenance>('/maintenances', {
      methods: 'POST',
      body: maintenance
    })

    return data.value
  } catch (error) {
    ElNotification({
      title: 'Error al crear el mantenimiento',
      type: 'error'
    })
  }
}

export const useUpdateMaintenance = async (id: number, maintenance: Maintenance) => {
  try {
    const { data, error } = await useApi<Maintenance>(`/maintenances/${id}`, {
      methods: 'PATCH',
      body: maintenance
    })

    return data.value
  } catch (error) {
    ElNotification({
      title: 'Error al actualizar el mantenimiento',
      type: 'error'
    })
  }
}