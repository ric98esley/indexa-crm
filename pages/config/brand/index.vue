<template>
  <el-container direction="vertical" class="p-3">
    <el-row :span="24" :gutter="12">
      <el-table :data="response.brands" stripe v-loading="loadingBrand">
        <el-table-column type="expand" width="50">
          <template #default="props">
            <el-row :span="24" :gutter="24" >
              <el-col :span="22" :offset="2">
                Creado por: {{ props.row.createdBy.name }} {{ props.row.createdBy.lastName }}
              </el-col>
              <el-col :span="22" :offset="2">
                Fecha de creación: {{ new Date(props.row.createdAt).toDateString() }}
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" width="50" />
        <el-table-column prop="name" label="Nombre">
          <template #header>
            <el-input :debounce="2000" v-model="filters.name" placeholder="Nombre" clearable />
          </template>
        </el-table-column>
        <el-table-column label="Cantidad de activos">
        </el-table-column>
        <el-table-column label="Acciones">
          <template #default="props">
            <el-row>
              <el-button type="info" circle @click="editBrand(props.row)">
                <Icon name="ep:edit" />
              </el-button>
              <el-button type="primary" circle>
                <Icon name="ep:view" />
              </el-button>
              <el-button type="danger" circle @click="removeBrand(props.row.id)">
                <Icon name="ep:delete" />
              </el-button>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="m-4" v-model:current-page="filters.offset" v-model:page-size="filters.limit"
        :page-sizes="[10, 20, 50, 100, 200, 300, 400]" :background="true" layout="total, sizes, prev, pager, next, jumper"
        :total="response.total" />

    </el-row>
  </el-container>
</template>

<script setup lang="ts">


definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'auditor'],
});

const loadingBrand = ref(false);

const filters = reactive({
  limit: 10,
  offset: 0,
  name: ''
});

const response = reactive<{
  brands: Brand[],
  total: number
}>({
  brands: [],
  total: 0
})

const modals = reactive({
  details: false,
  edit: false,
  create: false,
});


const brand = reactive<{
  id?: number,
  name: string,
  customFields: number[],
  removeFields: number[]
}>({
  id: undefined,
  name: '',
  customFields: [],
  removeFields: []
});


const getBrands = async () => {
  try {
    loadingBrand.value = true;
    const { data, error } = await useFetch<{ total: number, rows: Brand[] }>('/assets/brands',
      {
        params: {
          ...(filters.name != '' && filters.name && {
            name: filters.name
          }),
          ...(filters.offset && {
            offset: (filters.offset - 1) * filters.limit
          }),
          ...(filters.limit && {
            limit: filters.limit
          })
        }
      }
    );
    if (error.value) {
      ElNotification({
        message: 'Error al obtener las marcas intente de nuevo mas tarde'
      })
    }

    loadingBrand.value = false;
    return data.value
  } catch (error) {
    loadingBrand.value = false;
    ElNotification({
      message: 'Error al obtener las marcas intente de nuevo mas tarde'
    })
  }
}

const createBrand = async () => {
  try {
    loadingBrand.value = true;

    const { data, error } = await useFetch<Brand>('/assets/brands',
      {
        method: 'post',
        body: {
          name: brand.name,
          customFields: brand.customFields?.map((field) => {
            return { typeId: field }
          })
        }
      },
    )
    loadingBrand.value = false;

    if (error.value && error.value.statusCode && error.value.statusCode >= 400) {
      ElNotification({
        title: 'Error al crear marcas intente de nuevo mas tarde',
        message: error.value?.data.message.message,
      })
      return
    }
    await setBrands()
    ElNotification({
      title: 'Categoria creada correctamente',
      message: `${data.value?.name}`
    })
    brand.id = undefined;
    brand.name = '';
    brand.customFields = [];
    brand.removeFields = [];
    return data.value
  } catch (error) {
    loadingBrand.value = false;
    ElNotification({
      title: 'Error al crear marcas intente de nuevo mas tarde',
    })
  }
}

const patchBrand = async () => {
  try {
    loadingBrand.value = true;

    const body = {
      name: brand.name,
      customFields: brand.customFields?.map((field) => {
        return { typeId: field }
      }),
      removeFields: brand.removeFields?.map((field) => {
        return { typeId: field }
      })
    }

    const { data, error } = await useFetch<Brand>(`/assets/Brands/${brand.id}`,
      {
        method: 'PATCH',
        body
      }
    );
    loadingBrand.value = false;


    if (error.value) {
      throw error
    }
    await setBrands()
    ElNotification({
      title: 'Categoria modificada correctamente',
      message: `${data.value?.name}`
    })

    brand.id = undefined;
    brand.name = '';
    brand.customFields = [];
    brand.removeFields = [];
    return data.value
  } catch (error) {
    loadingBrand.value = false;
    ElNotification({
      title: 'Error al modificar la categoria intente de nuevo mas tarde',
    })
    console.log(error)
  }
}

const editBrand = (row: Brand) => {
  modals.edit = true;

  brand.id = row.id;
  brand.name = row.name || '';
}

const removeBrand = async (id: number) => {
  try {
    const { data, error } = await useFetch<Brand>(`/assets/brands/${id}`, {
      method: 'delete'
    })

    if (error.value) {
      loadingBrand.value = false;
      ElNotification({
        message: 'Error al borrar la categoria intente de nuevo mas tarde.'
      });
      return
    }

    ElNotification({
      message: 'La categoria ha sido borrada.'
    })
    await setBrands()
  } catch (error) {
    ElNotification({
      message: 'Error al borrar la categoria intente de nuevo mas tarde.'
    })
  }
}

const setBrands = async () => {
  const rta = await getBrands();
  response.brands = rta?.rows || []
  response.total = rta?.total || 0
}

watch(filters, useDebounce(async () => {
    await setBrands()
  }, 500)
)

onMounted(async () => {
  await setBrands();
});
</script>