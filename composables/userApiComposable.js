
export const authUserComposable = async (params) => {
    return $fetch('/api/authUser', {
        method: 'POST',
        body: {
            email: params.email,
            password: params.password
        },
    });
}
const userApiComposables = async (params) => {
    const config = useRuntimeConfig()

    return await $fetch(config.public.users.apiBase + '/getAll', {
        method: 'GET',
        query: params,
        /*headers: {
            Authorization: `Bearer ${token}`
        }*/
    });
}
export default userApiComposables;
