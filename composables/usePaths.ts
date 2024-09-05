export const useFindPath = async (find: FindPaths) => {
  const { data, error } = await useApi<{ total: number, rows: Paths[] }>('/paths',
    {
      method: 'GET',
      params: useFilterObject({
        ...find,
        offset: (find.offset - 1 ) * find.limit,
      }),
    },
  );

  if (error.value) {
    throw createError({
      statusCode: error.value.statusCode,
      message: 'No se pudo obtener la lista de rutas',
    });
  }

  if (!data.value) {
    return {
      total: 0,
      rows: [],
    };
  }

  return data.value;
}

export const useFindOnePath = async (id: number) => {
  const { data, error } = await useApi<Paths>(`/paths/${id}`,
    {
      method: 'GET',
    },
  );

  if (error.value) {
    throw createError({
      statusCode: error.value.statusCode,
      message: 'No se pudo obtener la ruta',
    });
  }

  return data.value;
}

export const useCreatePath = async (create: CreatePaths) => {
  const { data, error } = await useApi<Paths>('/paths',
    {
      method: 'POST',
      body: create,
    },
  );

  if (error.value) {
    throw createError({
      statusCode: error.value.statusCode,
      message: 'No se pudo crear la ruta',
    });
  }

  return data.value;
}

export const useUpdatePath = async (id: number, update: UpdatePaths) => {
  const { data, error } = await useApi<Paths>(`/paths/${id}`,
    {
      method: 'PATCH',
      body: useFilterObject(update),
    },
  );

  if (error.value) {
    throw createError({
      statusCode: error.value.statusCode,
      message: 'No se pudo actualizar la ruta',
    });
  }

  return data.value;
}

export const useDeletePath = async (id: number) => {
  const { error } = await useApi<Paths>(`/paths/${id}`,
    {
      method: 'DELETE',
    },
  );

  if (error.value) {
    throw createError({
      statusCode: error.value.statusCode,
      message: 'No se pudo eliminar la ruta',
    });
  }
}
