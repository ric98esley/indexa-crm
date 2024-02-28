<script setup>

const ROUTES = [
  'assets',
  'categories',
  'specifications',
  'brands',
  'models',
  'orders',
  'movements',
  'consumables',
  'users',
  'roles',
  'customers',
  'warehouses',
  'locations',
  'locations_types',
  'zones'
];

const crud = [
  'create',
  'read',
  'update',
  'delete',
  'export'
];

const SCOPES = [
  'any',
  'group',
  'own',
  'none'
]

const abilities = {
  assets: [
    ...crud,
    'import',
    'recovery',
    'checking',
    'checkout',
  ],
  models: [
    ...crud,
    'recovery'
  ],
  consumables: [
    ...crud
  ],
  movements: [
    ...crud
  ],
  roles: [
    ...crud
  ],
  warehouses: [
    ...crud,
    'recovery'
  ],
  orders: [
    ...crud,
    'recovery'
  ],
  locations: [
    ...crud,
    'recovery'
  ],
  categories: [
    ...crud,
    'recovery'
  ],
  specifications: [
    ...crud,
    'recovery'
  ],
  locations_types: [
    ...crud,
    'recovery'
  ],
  zones: [
    ...crud,
    'recovery',
  ],
  brands: [
    ...crud,
    'recovery'
  ],
  groups: [
    ...crud,
    'recovery'
  ],
  users: [
    ...crud,
    'recovery'
  ],
  customers: [
    ...crud,
    'recovery'
  ]
}

const model = reactive({
  name: '',
  ability: {
		assets: {
			create:"group",
			read: "group",
			update: "group",
			delete: "group",
			checkout:"group",
			checking: "group",
			import: "group",
			export: "group",
			recovery: "any"
		},
		models: {
			create:"any",
			read: "any",
			update: "any",
			delete: "any",
			export: "any",
			recovery: "any"
		},
		consumables: {
			create:"any",
			read: "any",
			update: "any",
			delete: "any",
			export: "any",
			recovery: "any"
		},
		movements: {
			create:"any",
			read: "any",
			update: "any",
			delete: "any",
			export: "any",
			recovery: "any"
		},
		roles: {
			create:"none",
			read: "any",
			update: "none",
			delete: "none",
			export: "none",
			recovery: "none"
		},
		warehouses: {
			create: "group",
			read: "group",
			update: "group",
			delete: "group",
			export: "group",
			recovery: "group"
		},
		orders: {
			create:"group",
			read: "group",
			update: "group",
			delete: "group",
			export: "group",
			recovery: "group"
		},
		locations: {
			create:"group",
			read: "group",
			update: "group",
			delete: "group",
			export: "group",
			recovery: "group"
		},
		categories: {
			create:"any",
			read: "any",
			update: "any",
			delete: "any",
			export: "any",
			recovery: "any"
		},
		specifications: {
			create:"any",
			read: "any",
			update: "any",
			delete: "any",
			export: "any",
			recovery: "none"
		},
		locations_types: {
			create:"any",
			read: "any",
			update: "any",
			delete: "any",
			export: "any",
			recovery: "any"
		},
		zones:{
			create:"any",
			read: "any",
			update: "any",
			delete: "any",
			export: "any",
			recovery: "any"
		},
		brands: {
			create:"any",
			read: "any",
			update: "any",
			delete: "any",
			export: "any",
			recovery: "any"
		},
		groups: {
			create:"group",
			read: "group",
			update: "group",
			delete: "group",
			export: "group",
			recovery: "group"
		},
		users: {
			create:"group",
			read: "group",
			update: "group",
			delete: "group",
			export: "group",
			recovery: "group"
		},
		customers: {
			create:"any",
			read: "any",
			update: "any",
			delete: "any",
			export: "any",
			recovery: "any"
		}
	}
})
</script>
<template>
  <el-col>
    <el-form label-position="top">
      <el-form-item label="Nombre" >
        <el-input v-model="model.name"/>
      </el-form-item>
      <el-row v-for="route in ROUTES">
        {{ route }}
        <el-col class="w-full">
          <el-form-item v-for="abi in abilities[route]" :label="abi">
            <el-radio-group v-model="model.ability[route][abi]">
              <el-radio v-for="scope in SCOPES" :label="scope">{{scope}}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </el-col>
</template>