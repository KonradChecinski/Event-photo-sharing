import { usePage } from '@inertiajs/react';

import logo from '../../images/logo.png';

export default function AppLogo() {
    const { name } = usePage().props;

    return (
        <>
            <div className="flex size-9 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
                <img src={logo} alt="Event Photo Sharing" className="size-full object-contain p-0.5" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate text-[13px] leading-tight font-semibold tracking-tight">
                    {name || 'Event Photo Sharing'}
                </span>
            </div>
        </>
    );
}
