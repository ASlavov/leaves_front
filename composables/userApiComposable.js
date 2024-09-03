
const authUser = async (params) => {
    const config = useRuntimeConfig()

    return await $fetch(config.public.users.apiBase + config.public.users.auth, {
        method: 'POST',
        query: params,
    });
}
const userApiComposables = async (params) => {
    const config = useRuntimeConfig()

    return await $fetch(config.public.users.apiBase + '/getAll', {
        method: 'GET',
        query: params,
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}
export default userApiComposables;
