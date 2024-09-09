export const leavesComposable = (userId) => {
    const config = useRuntimeConfig()

    return $fetch('/api/leaves/leaves', {
        method: 'POST',
        body: userId,
    });
};

const leavesApiComposable = () => {};
export default leavesApiComposable;