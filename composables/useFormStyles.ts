/**
 * Shared form design tokens derived from the Figma design system.
 * Apply these classes consistently across all modal form components.
 */
export const useFormStyles = () => ({
  input: [
    'h-[40px] py-[8px] px-[16px] block w-full',
    'border border-[#DFEAF2] rounded-[8px]',
    'bg-white text-[14px] text-black placeholder-[#808080]',
    'transition-all hover:border-gray-400',
    'focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
    'dark:bg-neutral-800 dark:border-neutral-600 dark:text-gray-100',
    'dark:placeholder-neutral-400 dark:hover:border-neutral-400',
  ].join(' '),

  telephone: [
    'block w-full bg-transparent',
    'text-[14px] text-black placeholder-[#808080]',
    'transition-all',
    'focus:outline-none',
    'dark:text-gray-100',
    'dark:placeholder-neutral-400',
  ].join(' '),

  label: 'block text-[14px] font-bold mb-[8px] text-black dark:text-gray-100',

  submitBtn: [
    'inline-flex items-center justify-center',
    'py-[15px] px-[20px]',
    'rounded-[70px]',
    'bg-[#EA021A] hover:bg-red-700',
    'text-[14px] font-bold text-white',
    'transition-colors focus:outline-none',
  ].join(' '),
});
