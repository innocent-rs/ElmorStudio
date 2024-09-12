import clsx from "clsx";
import {ChangeEvent, forwardRef, InputHTMLAttributes} from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    //disabled: boolean;
    value: string;
    handleChange: (value: string) => void;
    //placeholder?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ value, handleChange, ...props }, ref) => {
    return (
        <input
            type="text"
            className={clsx(
                "py-3 px-4 pe-11 block w-full border-gray-200 shadow-sm rounded-lg text-sm focus:z-10",
                "focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none",
                "dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500",
                "dark:focus:ring-neutral-600"
            )}
            value={value}
            onChange={(evt: ChangeEvent<HTMLInputElement>) => handleChange(evt.target.value)}
            ref={ref} // Forward the ref here
            {...props} // Spread the rest of the props
        />
    );
});
/*function Input({ value, handleChange, ...props}: InputProps) {
    return (
        <input
            type="text"
            className={clsx(
                "py-3 px-4 pe-11 block w-full border-gray-200 shadow-sm rounded-lg text-sm focus:z-10",
                "focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none",
                "dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500",
                "dark:focus:ring-neutral-600"
            )}
            value={value}
            onChange={(evt: ChangeEvent<HTMLInputElement>) => handleChange(evt.target.value) }
            {...props}
        />
    );
}*/
export default Input;