import { defineStore } from 'pinia';

export const useUserStore = defineStore('users',
  {
    state: (): { user: User, profile: Profile } => ({
      user: {
        id: undefined,
        username: '',
        email: '',
        role: '',
        password: '',
        isActive: false,
        groupId: undefined,
        profile: {
          name: '',
          lastName: '',
          cardId: '',
          phone: '',
        }
      },
      profile: {
        name: '',
        lastName: '',
        cardId: '',
        phone: '',
      }
    }),
    actions: {
      /**
       *  Modifica el usuario del estado
       *  de una manera que no deje el profile como null
       */
      setUser(user: User) {
        const profile = JSON.parse(JSON.stringify(user.profile));
        user.groupId = user.group?.id;

        const item = JSON.parse(JSON.stringify(user));
        delete item.profile;

        this.user = {
          ...this.user,
          ...item,
          ...(profile && {
            profile
          })
        }
      },

      resetUser() {
        this.user = {
          id: undefined,
          username: '',
          email: '',
          role: '',
          password: '',
          isActive: false,
          groupId: undefined,
          profile: {
            name: '',
            lastName: '',
            cardId: '',
            phone: '',
          }
        }
      }
    }
  }
)