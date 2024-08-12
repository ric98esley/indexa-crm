export const useFindMaintenanceType = async (filters: FindMaintenanceType = {}) => {
  try {
    const { data, error } = await useApi<{ rows: MaintenanceType[], total: number }>('/maintenances/types', {
      params: useFilterObject(filters)
    })

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
      method: 'PATCH',
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
      method: 'DELETE'
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

export const useFindMaintenance = async (filters: FindMaintenance = {}) => {
  try {
    const { data, error } = await useApi<{rows:Maintenance[], total: number}>('/maintenances', {
      params: useFilterObject(filters)
    })

    return data.value
  } catch (error) {
    ElNotification({
      title: 'Error al cargar los mantenimientos',
      type: 'error'
    })
  }
}

export const useCreateMaintenance = async (maintenance: CreateMaintenance) => {
  try {
    const { data, error } = await useApi<Maintenance>('/maintenances', {
      method: 'POST',
      body: useFilterObject(maintenance)
    })

    return data.value
  } catch (error) {
    ElNotification({
      title: 'Error al crear el mantenimiento',
      type: 'error'
    })
  }
}

export const useUpdateMaintenance = async (id: number, maintenance: CreateMaintenance) => {
  try {
    const { data, error } = await useApi<Maintenance>(`/maintenances/${id}`, {
      method: 'PATCH',
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