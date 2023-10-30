export const useAuth = () => {
  return class AuthService {
    async login(username: string, password: string ) {
      const { data, pending, error } = await useFetch<{ token: string, user: User }>('/auth/login', {
        method: 'post',
        body: {
          username,
          password,
        }
      });
      return {data, pending , error}
    }
  }
}