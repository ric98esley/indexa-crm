export const useAuth = () => {
  return class AuthService {
    async login(username: string, password: string) {
      const { data, pending, error } = await useFetch<{
        token: string;
        user: User;
        ability: string[];
      }>('/auth/login', {
        method: 'post',
        body: {
          username,
          password,
        },
      });
      return { data, pending, error };
    }
    async recovery(email: string) {
      try {
        const { data, error } = await useFetch<{
          token: string;
          user: User;
          ability: string[];
        }>('/auth/recovery', {
          method: 'post',
          body: {
            email
          },
        });
        if(error.value) {
          throw new Error(error.value.data.message);
        }

        ElNotification({
          title: 'Correo enviado',
          message: 'Por favor sigue las instrucciones del correo',
          type: 'success'
        })
        return data.value;
      } catch (error) {
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
      token:string,
      password:string
    }) {
      try {
        if(!token || token == '') throw new Error('No es posible cambiar la contraseña');
        const { data, error } = await useFetch<{
          token: string;
          user: User;
          ability: string[];
        }>('/auth/change-password', {
          method: 'post',
          body: {
            token,
            password
          },
        });
        if(error.value) {
          throw new Error(error.value.data.message);
        }

        ElNotification({
          title: 'Su contraseña ha sido cambiada',
          message: 'Por favor ingrese al sistema',
          type: 'success'
        })
        return data.value;
      } catch (error) {
        ElNotification({
          title: 'Error en la recuperación de la contraseña',
          message: error.message,
          type: 'error'
        });
      }
    }
  };
};
