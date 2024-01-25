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
          throw new Error(error.data.value.message);
        }

        ElNotification({
          title: 'Correo enviado',
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
