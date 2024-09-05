export const leavesComposable = () => {
    const config = useRuntimeConfig()

    return $fetch('/api/leaves/leaves', {
        method: 'GET',
    });
};

const leavesApiComposable = () => {};
export default leavesApiComposable;