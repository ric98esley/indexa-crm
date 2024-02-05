export const useProducts = () => {
  return class ProductService {
    async createProduct({
      name,
      code,
      price,
      description,
      categoryId,
      unit,
    }: {
      name: string;
      code: string;
      price: string;
      description: string;
      categoryId: number;
      unit: string;
    }) {
      try {
        const body = useFilterObject({
          name,
          code,
          price,
          description,
          categoryId,
          unit,
        });
        const { data, error } = await useFetch<Product>('/products', {
          method: 'post',
          body,
        });

        if (error.value) {
          throw new Error(error.value.data.message);
        }
        ElNotification({
          title: 'Tipo creada correctamente',
          message: `${data.value?.name}`,
        });

        return data.value;
      } catch (error) {
        ElNotification({
          title: 'Error al crear tipos intente de nuevo mas tarde',
          message: error.message,
        });
      }
    }

    async findOne({ id }: { id: number }) {
      try {
        const { data, error } = await useFetch<Product>(`/products/${id}`, {
          method: 'get',
        });

        if (error.value) {
          throw new Error(error.value.data.message);
        }

        return data.value;
      } catch (error) {
        ElNotification({
          title: 'Error al obtener el producto',
          message: error.message,
          type: 'error',
        });
      }
    }

    async patch({
      id,
      name,
      code,
      price,
      description,
      categoryId,
      unit,
    }: {
      id: number;
      name: string;
      code: string;
      price: string;
      description: string;
      categoryId: number;
      unit: string;
    }) {
      try {
        const body = useFilterObject({
          name,
          code,
          price,
          description,
          categoryId,
          unit,
        });
        const { data, error } = await useFetch<Product>(`/products/${id}`, {
          method: 'patch',
          body,
        });

        if (error.value) {
          throw new Error(error.value.data.message);
        }

        return data.value;
      } catch (error) {
        ElNotification({
          title: 'Error al obtener el producto',
          message: error.message,
          type: 'error',
        });
      }
    }

    async find({
      search,
      name,
      code,
      price,
      description,
      category,
      unit,
      limit,
      offset,
    }: {
      search?: string;
      name?: string;
      code?: string;
      price?: string;
      description?: string;
      category?: string;
      unit?: string;
      limit?: number;
      offset?: number;
    }) {
      try {
        const params = useFilterObject({
          search,
          name,
          code,
          price,
          description,
          category,
          unit,
          limit,
          offset,
        });
        const { data, error } = await useFetch<{
          total: number;
          rows: Product[];
        }>('/products', {
          params,
        });
        if (error.value) {
          throw new Error(error.value.data.message);
        }

        return data.value;
      } catch (error) {
        ElNotification({
          title: 'Error al obtener los tipos intente de nuevo mas tarde',
          message: error.message,
        });
      }
    }
  };
};
