import type { NuxtError } from "#app";

const baseURL = '/auth';
export const useAuth = () => {
  return class AuthService {
    async recovery(email: string) {
      try {
        const { data, error } = await useApi<{
          token: string;
          user: User;
          ability: string[];
        }>(baseURL + '/recovery', {
          method: 'post',
          body: {
            email
          },
        });
        if (error.value) {
          throw new Error(error.value.data.message);
        }

        ElNotification({
          title: 'Correo enviado',
          message: 'Por favor sigue las instrucciones del correo',
          type: 'success'
        })
        return data.value;
      } catch (error: any) {
        ElNotification({
          title: 'Error en la recuperación de la contraseña',
          message: error.message,
          type: 'error'
        });
      }
    }
    async changePassword({
      token,
      password
    }:
      {
        token: string,
        password: string
      }) {
      try {
        if (!token || token == '') throw new Error('No es posible cambiar la contraseña');
        const { data, error } = await useApi<{
          token: string;
          user: User;
          ability: string[];
        }>(baseURL + '/change-password', {
          method: 'post',
          body: {
            token,
            password
          },
        });
        if (error.value) {
          throw new Error(error.value.data.message);
        }

        ElNotification({
          title: 'Su contraseña ha sido cambiada',
          message: 'Por favor ingrese al sistema',
          type: 'success'
        })
        return data.value;
      } catch (error: any) {
        ElNotification({
          title: 'Error en la recuperación de la contraseña',
          message: error.message,
          type: 'error'
        });
      }
    }
  };
};

export const useLogin = async (username: string, password: string) => {
  try {
    const { data, error } = await useApi<{
      token: string;
      refreshToken: string;
      user: User;
      ability: string[];
    }>(baseURL + '/login', {
      method: 'post',
      body: {
        username,
        password,
      },
    });

    if (error.value || !data.value) {
      throw new Error(error.value?.data.message);
    }
    return data.value;
  } catch (error) {
    ElNotification({
      title: 'Error en el inicio de sesión',
      type: 'error'
    });
  }
}

export const useRefreshToken = async () => {

  const { data, error } = await useFetch<{
    token: string;
    user: User;
    refreshToken: string;
    ability: string[];
  }>(baseURL + '/check', {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('indexa-refresh')
    },
    baseURL: useRuntimeConfig().public.apiUrl,
    method: 'POST',
  });

  if (error.value) {
    if (error.value.statusCode === 401) {
      throw createError({
        message: 'Sección expirada',
        statusCode: 401,
      });
    }
  }

  if (!data.value) {
    throw createError({
      message: 'Error al refrescar el token',
      statusCode: 401,
    });
  }

  return data.value
}
