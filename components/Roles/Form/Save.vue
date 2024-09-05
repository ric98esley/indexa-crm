<script setup lang="ts">
const props = defineProps({
	form: {
		type: Object,
		default: () => ({
			name: '',
			ability: {}
		})
	},
})

const emit = defineEmits(['submit'])

const activeName = ref('asset')

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
	'maintenances',
	'geolocation',
	'paths',
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
	'none'
]

const abilities: { [key: string]: string[] } = {
	assets: [
		...crud,
		'import',
		'recovery',
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
		'recovery',
	],
	orders: [
		...crud,
		'recovery',
		'checking',
		'checkout',
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
	],
	users: [
		...crud,
	],
	customers: [
		...crud,
	],
	paths: [
		...crud,
	],
	geolocation: [
		...crud,
	],
	maintenances: [
		...crud,
	],
};

const model = reactive({
	name: props.form.name,
	ability: {
				assets: {
					create: props.form.ability.assets?.create ?? 'none',
					read: props.form.ability.assets?.read ?? 'group',
					update: props.form.ability.assets?.update ?? 'none',
					delete: props.form.ability.assets?.delete ?? 'none',
					import: props.form.ability.assets?.import ?? 'none',
					export: props.form.ability.assets?.export ?? 'none',
					recovery: props.form.ability.assets?.recovery ?? 'none'
				},
				models: {
					create: props.form.ability.models?.create ?? 'none',
					read: props.form.ability.models?.read ?? 'any',
					update: props.form.ability.models?.update ?? 'none',
					delete: props.form.ability.models?.delete ?? 'none',
					export: props.form.ability.models?.export ?? 'none',
					recovery: props.form.ability.models?.recovery ?? 'none'
				},
				consumables: {
					create: props.form.ability.consumables?.create ?? 'none',
					read: props.form.ability.consumables?.read ?? 'group',
					update: props.form.ability.consumables?.update ?? 'none',
					delete: props.form.ability.consumables?.delete ?? 'none',
					export: props.form.ability.consumables?.export ?? 'none',
					recovery: props.form.ability.consumables?.recovery ?? 'none'
				},
				movements: {
					create: props.form.ability.movements?.create ?? 'none',
					read: props.form.ability.movements?.read ?? 'group',
					update: props.form.ability.movements?.update ?? 'none',
					delete: props.form.ability.movements?.delete ?? 'none',
					export: props.form.ability.movements?.export ?? 'none',
					recovery: props.form.ability.movements?.recovery ?? 'none'
				},
				roles: {
					create: props.form.ability.roles?.create ?? 'none',
					read: props.form.ability.roles?.read ?? 'any',
					update: props.form.ability.roles?.update ?? 'none',
					delete: props.form.ability.roles?.delete ?? 'none',
					export: props.form.ability.roles?.export ?? 'none',
					recovery: props.form.ability.roles?.recovery ?? 'none'
				},
				warehouses: {
					create: props.form.ability.warehouses?.create ?? 'group',
					read: props.form.ability.warehouses?.read ?? 'group',
					update: props.form.ability.warehouses?.update ?? 'group',
					delete: props.form.ability.warehouses?.delete ?? 'group',
					export: props.form.ability.warehouses?.export ?? 'group',
					recovery: props.form.ability.warehouses?.recovery ?? 'group',
				},
				orders: {
					create: props.form.ability.orders?.create ?? 'none',
					read: props.form.ability.orders?.read ?? 'group',
					update: props.form.ability.orders?.update ?? 'none',
					delete: props.form.ability.orders?.delete ?? 'none',
					checking: props.form.ability.orders?.checking ?? 'none',
					checkout: props.form.ability.orders?.checkout ?? 'none',
					export: props.form.ability.orders?.export ?? 'none',
					recovery: props.form.ability.orders?.recovery ?? 'none'
				},
				locations: {
					create: props.form.ability.locations?.create ?? 'group',
					read: props.form.ability.locations?.read ?? 'group',
					update: props.form.ability.locations?.update ?? 'group',
					delete: props.form.ability.locations?.delete ?? 'group',
					export: props.form.ability.locations?.export ?? 'group',
					recovery: props.form.ability.locations?.recovery ?? 'group'
				},
				categories: {
					create: props.form.ability.categories?.create ?? 'none',
					read: props.form.ability.categories?.read ?? 'any',
					update: props.form.ability.categories?.update ?? 'none',
					delete: props.form.ability.categories?.delete ?? 'none',
					export: props.form.ability.categories?.export ?? 'none',
					recovery: props.form.ability.categories?.recovery ?? 'none'
				},
				specifications: {
					create: props.form.ability.specifications?.create ?? 'none',
					read: props.form.ability.specifications?.read ?? 'any',
					update: props.form.ability.specifications?.update ?? 'none',
					delete: props.form.ability.specifications?.delete ?? 'none',
					export: props.form.ability.specifications?.export ?? 'none',
					recovery: props.form.ability.specifications?.recovery ?? 'none'
				},
				locations_types: {
					create: props.form.ability.locations_types?.create ?? 'none',
					read: props.form.ability.locations_types?.read ?? 'any',
					update: props.form.ability.locations_types?.update ?? 'none',
					delete: props.form.ability.locations_types?.delete ?? 'none',
					export: props.form.ability.locations_types?.export ?? 'none',
					recovery: props.form.ability.locations_types?.recovery ?? 'none'
				},
				zones: {
					create: props.form.ability.zones?.create ?? 'none',
					read: props.form.ability.zones?.read ?? 'any',
					update: props.form.ability.zones?.update ?? 'none',
					delete: props.form.ability.zones?.delete ?? 'none',
					export: props.form.ability.zones?.export ?? 'none',
					recovery: props.form.ability.zones?.recovery ?? 'none'
				},
				brands: {
					create: props.form.ability.brands?.create ?? 'none',
					read: props.form.ability.brands?.read ?? 'any',
					update: props.form.ability.brands?.update ?? 'none',
					delete: props.form.ability.brands?.delete ?? 'none',
					export: props.form.ability.brands?.export ?? 'none',
					recovery: props.form.ability.brands?.recovery ?? 'none'
				},
				groups: {
					create: props.form.ability.groups?.create ?? 'none',
					read: props.form.ability.groups?.read ?? 'group',
					update: props.form.ability.groups?.update ?? 'none',
					delete: props.form.ability.groups?.delete ?? 'none',
					export: props.form.ability.groups?.export ?? 'none',
					recovery: props.form.ability.groups?.recovery ?? 'none'
				},
				users: {
					create: props.form.ability.users?.create ?? 'none',
					read: props.form.ability.users?.read ?? 'group',
					update: props.form.ability.users?.update ?? 'none',
					delete: props.form.ability.users?.delete ?? 'none',
					export: props.form.ability.users?.export ?? 'none',
					recovery: props.form.ability.users?.recovery ?? 'none'
				},
				customers: {
					create: props.form.ability.customers?.create ?? 'none',
					read: props.form.ability.customers?.read ?? 'any',
					update: props.form.ability.customers?.update ?? 'none',
					delete: props.form.ability.customers?.delete ?? 'none',
					export: props.form.ability.customers?.export ?? 'none',
					recovery: props.form.ability.customers?.recovery ?? 'none'
				},
				geolocation: {
					create: props.form.ability.geolocation?.create ?? 'none',
					read: props.form.ability.geolocation?.read ?? 'any',
					update: props.form.ability.geolocation?.update ?? 'none',
					delete: props.form.ability.geolocation?.delete ?? 'none',
					export: props.form.ability.geolocation?.export ?? 'none',
					recovery: props.form.ability.geolocation?.recovery ?? 'none'
				},
				maintenances: {
					create: props.form.ability.maintenances?.create ?? 'none',
					read: props.form.ability.maintenances?.read ?? 'any',
					update: props.form.ability.maintenances?.update ?? 'none',
					delete: props.form.ability.maintenances?.delete ?? 'none',
					export: props.form.ability.maintenances?.export ?? 'none',
					recovery: props.form.ability.maintenances?.recovery ?? 'none'
				},
				paths: {
					create: props.form.ability.paths?.create ?? 'none',
					read: props.form.ability.paths?.read ?? 'any',
					update: props.form.ability.paths?.update ?? 'none',
					delete: props.form.ability.paths?.delete ?? 'none',
					export: props.form.ability.paths?.export ?? 'none',
					recovery: props.form.ability.paths?.recovery ?? 'none'
				},
			}
})

const handlerSubmit = () => {
	if (!model.name) return
	emit('submit', model)
}

</script>
<template>
	<el-form label-position="top" :model="model" @submit.prevent="handlerSubmit">
		<el-form-item label="Nombre del rol">
			<el-input v-model="model.name" placeholder="Nombre del rol"></el-input>
		</el-form-item>
		<el-collapse v-model="activeName" class="demo-tabs">
			<el-collapse-item v-for="route in ROUTES" :title="route">
				<el-row>
					<el-col class="w-full">
						<el-form-item v-for="abi in abilities[route]" :label="abi">
							<el-radio-group v-model="model.ability[route][abi]">
								<el-radio v-for="scope in SCOPES" :label="scope">{{ scope }}</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
				</el-row>
			</el-collapse-item>
		</el-collapse>
		<el-form-item>
			<el-button type="primary" native-type="submit">Guardar</el-button>
		</el-form-item>
	</el-form>
</template>