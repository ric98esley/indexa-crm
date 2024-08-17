export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (error, vm, info) => {
    console.log('Global error handler');
    handleGlobalError(error);
  };

  return {
    provide: {
      errorHandler: handleGlobalError,
    }
  }
})

function handleGlobalError(error: any) {
  ElNotification({
    title: 'Ocurrió un error',
    message: error.message || 'Error inesperado',
    type: 'error',
  });

  // Lógica adicional de manejo de errores
  if (error.message === 'User not found') {
    navigateTo('/login');
  }
}